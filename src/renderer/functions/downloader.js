// const youtubedl = require('youtube-dl')
const ffmpeg = require('@ffmpeg-installer/ffmpeg')
const fs = require('fs')
// const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const ytdlPath = '.\\node_modules\\youtube-dl\\bin\\youtube-dl.exe'
// const tmpdir = path.join(os.tmpdir(), 'jaguardownloader')

function downloader (url, info, savePath, progressCallback, errorCallback) {
  const needsConvert = info.convert
  const doubleStream = info.format.length === 2
  const needsFFMPEG = needsConvert || doubleStream || info.format[0].ext !== info.ext
  const firstStreamName = `${info.id}_first.${info.format[0].ext}`
  const secondStreamName = (doubleStream) ? `${info.id}_second.${info.format[1].ext}` : null
  const filename = `${info.filename}.${info.ext}`

  const download = () => {
    return new Promise((resolve, reject) => {
      const firstStream = spawn(ytdlPath, ['--newline', '-f', info.format[0].id, '--output', firstStreamName, url])
      console.log((ytdlPath, ['--newline', '-f', info.format[0].id, '--output', firstStreamName, url]))
      firstStream.stdout.on('data', data => {
        if (data.includes('[download]') && data.includes('%')) {
          const progressString = String(data).split(' ').filter(el => el.includes('%'))[0]
          const perc = progressString.slice(0, progressString.length - 1)
          progressCallback('downloading', Math.round(perc))
        }
      })

      firstStream.stderr.on('data', data => {
        console.log(`stderr: ${data}`)
      })

      firstStream.on('error', (error) => {
        reject(error.message)
      })

      firstStream.on('close', code => {
        console.log(`child process exited with code ${code}`)
        console.log('finished downloading')
        resolve()
      })

      if (info.format.length === 2) {
        const secondStream = spawn(ytdlPath, ['--newline', '-f', info.format[1].id, '--output', secondStreamName, url])
        console.log(ytdlPath, ['--newline', '-f', info.format[1].id, '--output', secondStreamName, url])
        secondStream.stderr.on('data', data => {
          console.log(`stderr: ${data}`)
        })

        secondStream.on('error', (error) => {
          console.log(`error: ${error.message}`)
          reject(error.message)
        })

        secondStream.on('close', code => {
          console.log(`child process exited with code ${code}`)
        })
      }
    })
  }

  const convert = () => {
    return new Promise((resolve, reject) => {
      if (needsFFMPEG) {
        console.log('started converting')
        const opts =
          (needsConvert && doubleStream) ? ['-i', firstStreamName, '-i', secondStreamName, filename]
            : (doubleStream) ? ['-i', firstStreamName, '-i', secondStreamName, '-codec', 'copy', filename]
              : (needsConvert) ? ['-i', firstStreamName, filename]
                : ['-i', firstStreamName, '-codec', 'copy', filename]
        console.log(opts)

        const cmd = spawn(ffmpeg.path, opts)
        console.log(ffmpeg.path, opts)

        cmd.stdout.on('data', data => {
          console.log(`stdout: ${data}`)
        })

        cmd.stderr.on('data', data => {
          if (info.format[0].fps && info.duration) {
            const frame = parseOutput(String(data))
            const perc = getPerc(frame, info.format[0].fps, info.duration)
            progressCallback('merging/converting', perc)
          } else {
            // progress cannot be determined
            progressCallback('converting', 40)
          }
        })

        cmd.on('error', (error) => {
          console.log(`error: ${error.message}`)
          reject(new Error('conversion/merging failed'))
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
      } else {
        console.log('not converting')
        fs.rename(firstStreamName, filename, err => {
          if (err) reject(new Error('couldn\'t rename file: ' + err.message))
          else resolve()
        })
      }
    })
  }

  const move = () => {
    console.log('moving file')
    return new Promise((resolve, reject) => {
      fs.rename(filename, path.join(savePath, filename), (err) => {
        if (err) reject(new Error('error moving file: ' + err.message))
        else resolve()
      })
    })
  }

  const wait = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 1000)
    })
  }
  download()
    .then(wait) // give youtube-dl the time to finish
    .then(convert)
    .then(move)
    .then(() => {
      console.log('finished !')
      progressCallback('finished', 100)
    })
    .catch(err => errorCallback(err))
}

function parseOutput (output) {
  const splitted = output.split(' ').filter(el => (el !== ''))
  const frame = splitted[splitted.indexOf('frame=') + 1]
  return (!isNaN(frame)) ? frame
    : 0
}

function getPerc (frame, fps, duration) {
  return Math.round(frame / (duration * fps) * 100)
}

// if (require.main === module) {
//   const info = JSON.parse(fs.readFileSync('setting.json').toString())
//   downloader('https://www.vrt.be/vrtnu/a-z/wat-zegt-de-wetenschap/2019-2020/wat-zegt-de-wetenschap-d20191230-s2019-2020a5/', info, 'C:/users/ragna/desktop', (status, progress) => {
//     console.log(status, progress)
//   })
// }

export default downloader
