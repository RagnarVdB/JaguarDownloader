const ffmpeg = require('@ffmpeg-installer/ffmpeg')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const { spawn } = require('child_process')
const { getYtdlBinary } = require('youtube-dl')

const ytdlPath = getYtdlBinary()
const ffmpegPath = ffmpeg.path.replace('app.asar', 'app.asar.unpacked')
const tmpObj = tmp.dirSync({unsafeCleanup: true}) // allow tempfolder to be deleted even when download failed
const tempDir = tmpObj.name

function downloader (url, info, savePath, progressCallback, errorCallback) {
  const needsConvert = info.convert
  const doubleStream = info.format.length === 2
  const needsFFMPEG = needsConvert || doubleStream || info.format[0].ext !== info.ext
  const firstStreamName = path.join(tempDir, `${info.id}_first.${info.format[0].ext}`)
  const secondStreamName = (doubleStream) ? path.join(tempDir, `${info.id}_second.${info.format[1].ext}`) : null
  const filename = `${info.filename}.${info.ext}`
  const filePath = path.join(tempDir, filename)

  const download = () => new Promise((resolve, reject) => {
    let progressErr = false
    let finishedFirst = false
    let finishedSecond = false
    const firstStream = spawn(ytdlPath, ['--newline', '-f', info.format[0].id, '--output', firstStreamName, url])
    firstStream.stdout.on('data', data => {
      if (data.includes('[download]') && data.includes('%')) {
        const progressString = String(data).split(' ').filter(el => el.includes('%'))[0]
        const perc = progressString.slice(0, progressString.length - 1)
        progressCallback('downloading', Math.round(perc))
      } else {
        if (!progressErr) {
          progressCallback('downloading', 'indeterminate')
        }
      }
    })

    firstStream.stderr.on('data', data => {
      console.log(`stderr: ${data}`)
      if (data.includes('frame=') && info.format[0].fps && info.duration) {
        const frame = parseOutput(String(data))
        const perc = getPerc(frame, info.format[0].fps, info.duration)
        console.log(frame, perc)
        progressCallback('downloading', perc)
      } else {
        progressErr = false
      }
    })

    firstStream.on('error', (error) => {
      reject(error.message)
    })

    firstStream.on('close', code => {
      finishedFirst = true
      console.log(`child process exited with code ${code}`)
      console.log('finished downloading video')
      if (finishedSecond || !doubleStream) resolve()
    })

    if (doubleStream) {
      const secondStream = spawn(ytdlPath, ['--newline', '-f', info.format[1].id, '--output', secondStreamName, url])
      secondStream.stderr.on('data', data => {
        console.log(`stderr: ${data}`)
      })

      // process doesn't close when stdout isn't read.
      // I have no idea why
      secondStream.stdout.on('data', data => {
        console.log(String(data))
      })

      secondStream.on('error', (error) => {
        console.log(`error: ${error.message}`)
        reject(error.message)
      })

      secondStream.on('close', code => {
        finishedSecond = true
        console.log(`child process exited with code ${code}`)
        console.log('finished downloading audio')
        if (finishedFirst) resolve()
      })
    }
  })

  const convert = () => new Promise((resolve, reject) => {
    console.log('started converting')
    const opts =
      (needsConvert && doubleStream) ? ['-i', firstStreamName, '-i', secondStreamName, filePath]
        : (doubleStream) ? ['-i', firstStreamName, '-i', secondStreamName, '-codec', 'copy', filePath]
          : (needsConvert) ? ['-i', firstStreamName, filePath]
            : ['-i', firstStreamName, '-codec', 'copy', filePath]
    const cmd = spawn(ffmpegPath, opts)
    cmd.stdout.on('data', data => {
      console.log(`stdout: ${data}`)
    })
    cmd.stderr.on('data', data => {
      if (info.format[0].fps && info.duration) {
        console.log(String(data))
        const frame = parseOutput(String(data))
        console.log('frame: ', frame)
        const perc = (frame !== 'indeterminate') ? getPerc(frame, info.format[0].fps, info.duration) : 'indeterminate'
        progressCallback('merging/converting', perc)
      } else {
        // progress cannot be determined
        progressCallback('converting', 'indeterminate')
      }
    })
    cmd.on('error', (error) => {
      console.error(`error: ${error.message}`)
      reject(new Error(`conversion/merging failed, ${error.message}`))
    })
    cmd.on('close', code => {
      console.log(`child process exited with code ${code}`)
      if (code !== 0) {
        reject(new Error('conversion/merging failed'))
      }
      // remove old files
      fs.unlink(firstStreamName, err => {
        if (err) reject(err)
        resolve()
      })
      if (doubleStream) {
        fs.unlink(secondStreamName, err => { if (err) reject(err) })
      }
    })
  })

  const tagger = () => new Promise((resolve, reject) => {
    const result = filePath.slice(0, filePath.length - 4) + '_tagged' + filePath.slice(filePath.length - 4, filePath.length)
    console.log('tagging')
    const opts = ['-i', filePath, '-codec', 'copy']
    for (const tag in info.tags) {
      opts.push(`-metadata`, `${tag}=${info.tags[tag]}`)
    }
    opts.push(result) // ffmpeg can't overwrite the file
    console.log(ffmpegPath, opts)
    const cmd = spawn(ffmpegPath, opts)
    cmd.on('error', err => {
      reject(new Error('couldn\'t tag file', err))
    })
    cmd.stderr.on('data', data => {
      console.log(`stderr: ${data}`)
    })
    cmd.on('close', code => {
      console.log('child exited with code ' + code)
      fs.unlink(filePath, err => {
        if (err) reject(err)
        fs.rename(result, filePath, err => {
          if (err) reject(err)
          resolve()
        })
      })
    })
  })

  const move = () => new Promise((resolve, reject) => {
    console.log('moving file')
    fs.rename(filePath, path.join(savePath, filename), (err) => {
      if (err) reject(new Error('error moving file: ' + err.message))
      else resolve()
    })
  })

  const wait = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 1000)
    })
  }
  download()
    .then(wait) // give youtube-dl the time to finish
    .then(() => {
      if (needsFFMPEG) {
        return convert()
      } else {
        console.log('not converting')
        // the file needs to be renamed
        fs.rename(firstStreamName, filePath, err => {
          if (err) Promise.reject(new Error('couldn\'t rename file: ' + err.message))
          else Promise.resolve()
        })
      }
    })
    .then(() => {
      if (info.tag) {
        return tagger()
      } else {
        return Promise.resolve()
      }
    })
    .then(move)
    .then(() => {
      progressCallback('FINISHED!', 100)
      tmpObj.removeCallback()
    })
    .catch(err => {
      tmpObj.removeCallback()
      errorCallback(err)
    })
}

function parseOutput (output) {
  const frameString = output.slice(output.indexOf('frame=') + 6, output.length)
  const items = frameString.split(' ')
  let frame = 'indeterminate'
  for (let item of items) {
    if (Number(item) !== 0 && !isNaN(item)) {
      frame = Number(item)
      break
    }
  }
  return frame
}

function getPerc (frame, fps, duration) {
  return Math.round(frame / (duration * fps) * 100)
}

export default downloader
