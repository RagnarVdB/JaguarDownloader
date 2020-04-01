const { Stream } = require('stream')
const youtubedl = require('youtube-dl')
const fs = require('fs')
const os = require('os')
const path = require('path')

const tmpdir = path.join(os.tmpdir(), 'jaguardownloader')

function downloader (url, info, stream) {
  let ext
  if (info.convert) {
    ext = 'mkv'
  } else {
    ext = info.ext
  }
  console.log(url, tmpdir)
  const video = youtubedl(url, ['-f', info.format[0].id], { cwd: tmpdir })

  let size
  let pos = 0
  video.on('info', function (info) {
    console.log('Download started')
    console.log('filename: ' + info._filename)
    console.log('size: ' + info.size)
    size = info.size
    console.log(`${info.id}.${ext}`)
    video.pipe(fs.createWriteStream(`${info.id}_video.${ext}`))
  })
  video.on('data', (chunk) => {
    if (size) {
      pos += chunk.length
      const perc = Math.round((pos / size) * 100)
      stream.push({status: 'downloading', progress: perc})
    }
  })
  if (info.format.length === 2) {
    const audio = youtubedl(url, ['-f', info.format[0].id], {cwd: tmpdir})
    audio.pipe(fs.createWriteStream(`${info.id}_audio.${ext}`))
  }
}

// function getPerc(frame, fps, duration) {
//   return Math.round(frame / (duration * fps))
// }

if (require.main === module) {
  let info = JSON.parse(fs.readFileSync('setting.json').toString())
  const stream = new Stream.Readable({
    read () {},
    objectMode: true
  })
  downloader('https://www.youtube.com/watch?v=3RYNThid23g', info, stream)
  stream.on('readable', () => console.log(stream.read().progress))
}

// export { downloader }
