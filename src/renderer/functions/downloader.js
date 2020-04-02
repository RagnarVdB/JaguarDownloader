const youtubedl = require('youtube-dl')
const fs = require('fs')
const os = require('os')
const path = require('path')
// const { spawn } = require('child_process')

const tmpdir = path.join(os.tmpdir(), 'jaguardownloader')

function downloader (url, info, progressCallback) {
  const ext = info.convert ? 'mkv' : info.ext
  console.log(url, tmpdir)

  const video = youtubedl(url, ['-f', info.format[0].id], { cwd: tmpdir })

  let size
  let pos = 0
  video.on('info', (data) => {
    console.log('Download started')
    size = data.size
    console.log(`${info.id}.${ext}`)
    video.pipe(fs.createWriteStream(`${info.id}_video.${ext}`))
  })

  video.on('data', chunk => {
    pos += chunk.length
    if (size) {
      const perc = Math.round((pos / size) * 100)
      progressCallback('downloading', perc)
    }
  })

  if (info.format.length === 2) {
    const audio = youtubedl(url, ['-f', info.format[0].id], {cwd: tmpdir})
    audio.on('info', () => {
      audio.pipe(fs.createWriteStream(`${info.id}_audio.${ext}`))
    })
  }

  // merging
  // const cmd = spawn('ffmpeg', ['-i', 'video.mkv', '-i' ,'audio.mkv', 'merged.mkv']);
}

// function getPerc(frame, fps, duration) {
//   return Math.round(frame / (duration * fps))
// }

if (require.main === module) {
  let info = JSON.parse(fs.readFileSync('setting.json').toString())
  downloader('https://www.youtube.com/watch?v=3RYNThid23g', info, (status, progress) => {
    console.log(status, progress)
  })
}

// export { downloader }
