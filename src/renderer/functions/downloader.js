const youtubedl = require('youtube-dl')
const ffmpeg = require('@ffmpeg-installer/ffmpeg')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const tmpdir = path.join(os.tmpdir(), 'jaguardownloader')

function downloader (url, info, savepath, progressCallback) {
  const needsConvert = info.convert
  const doubleStream = info.format.length === 2
  const needsFFMPEG = needsConvert || doubleStream
  const videoName = needsFFMPEG ? `${info.id}_video.${info.format[0].ext}` : `${info.id}_video.${info.ext}`
  const audioName = (needsConvert && doubleStream) ? `${info.id}_audio.${info.format[1].ext}` : `${info.id}_audio.${info.ext}`
  const filename = `${info.filename}.${info.ext}`
  const download = () => {
    return new Promise((resolve, reject) => {
      const video = youtubedl(url, ['-f', info.format[0].id], { cwd: tmpdir })
      let size
      let pos = 0
      video.on('info', (data) => {
        console.log('Download started')
        size = data.size
        video.pipe(fs.createWriteStream(videoName))
      })

      video.on('data', chunk => {
        pos += chunk.length
        if (size) {
          const perc = Math.round((pos / size) * 100)
          progressCallback('downloading', perc)
        }
      })

      video.on('end', () => {
        resolve()
      })

      if (info.format.length === 2) {
        const audio = youtubedl(url, ['-f', info.format[1].id], {cwd: tmpdir})
        audio.on('info', () => {
          audio.pipe(fs.createWriteStream(audioName))
        })
      }
    })
  }

  const convert = () => {
    return new Promise((resolve, reject) => {
      if (needsFFMPEG) {
        const opts =
          (needsConvert && doubleStream) ? ['-i', videoName, '-i', audioName, filename]
            : (doubleStream) ? ['-i', videoName, '-i', audioName, '-codec', 'copy', filename]
              : ['-i', videoName, filename]
        const cmd = spawn(ffmpeg.path, opts)

        cmd.stdout.on('data', data => {
          console.log(`stdout: ${data}`)
        })

        cmd.stderr.on('data', data => {
          if (info.format[0].fps && info.duration) {
            const frame = parseOutput(String(data))
            const perc = getPerc(frame, info.format[0].fps, info.duration)
            progressCallback('merging/converting', perc)
          } else {
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
          fs.unlink(videoName, err => {
            if (err) console.error(err)
            resolve()
          })
          if (doubleStream) {
            fs.unlink(audioName, err => { if (err) console.error(err) })
          }
        })
      } else {
        fs.rename(videoName, filename, err => {
          if (err) reject(new Error('couldn\'t rename file: ' + err.message))
          else resolve()
        })
      }
    })
  }

  const move = () => {
    return new Promise((resolve, reject) => {
      fs.rename(filename, path.join(savepath, filename), (err) => {
        if (err) reject(new Error('error moving file: ' + err.message))
        else resolve()
      })
    })
  }

  download()
    .then(convert)
    .then(move)
    .then(() => console.log('done merging'))
    .catch(err => console.error(err))
}

function parseOutput (output) {
  const splitted = output.split(' ').filter(el => (el !== ''))
  const frame = splitted[splitted.indexOf('frame=') + 1]
  return (!isNaN(frame)) ? frame
    : 0
}

function getPerc (frame, fps, duration) {
  console.log(frame, fps, duration)
  return Math.round(frame / (duration * fps) * 100)
}

if (require.main === module) {
  const info = JSON.parse(fs.readFileSync('setting.json').toString())
  downloader('https://www.vrt.be/vrtnu/a-z/wat-zegt-de-wetenschap/2019-2020/wat-zegt-de-wetenschap-d20191230-s2019-2020a5/', info, 'C:/users/ragna/desktop', (status, progress) => {
    console.log(status, progress)
  })
}

// export { downloader }
