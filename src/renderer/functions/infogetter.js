const ytdl = require('youtube-dl')
// const fs = require('fs')

const GetInfo = (url) => {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, ['--yes-playlist'], (err, info) => {
      // console.log('info', info)
      if (err) reject(err)
      var infos = []
      if (Array.isArray(info) && info[0].extractor_key === 'Youtube') {
        for (let video of info) {
          infos.push(YoutubeHandler(video))
        }
      } else if (info.extractor_key === 'Youtube') {
        infos.push(YoutubeHandler(info))
      } else if (info.extractor_key === 'Canvas') {
        infos.push(VrtHandler(info))
      }

      // fs.writeFile('infos_youtube.json', JSON.stringify(infos), 'utf-8', (err) => console.log(err))
      // fs.writeFile('info.json', JSON.stringify(info), 'utf-8', err => console.error(err))
      if (infos.length === 0) reject(new Error('error occurred'))
      resolve(infos)
    })
  })
}

const YoutubeHandler = (video) => {
  const VideoFormats = [
    '144p',
    '240p',
    '360p',
    '480p',
    '720',
    '1080p',
    '1440p',
    '2160p',
    'DASH video'
  ]
  const AudioFormats = ['DASH audio', 'tiny']

  let formats = []
  for (let format of video.formats) {
    if (VideoFormats.includes(format.format_note)) {
      formats.push({
        id: format.format.split(' ')[0],
        ext: format.ext,
        filesize: format.filesize,
        format_note: format.format_note,
        fps: format.fps,
        type: 'video'
      })
    } else if (AudioFormats.includes(format.format_note)) {
      formats.push({
        id: format.format.split(' ')[0],
        ext: format.ext,
        filesize: format.filesize,
        format_note: format.format_note,
        fps: format.fps,
        type: 'audio'
      })
    }
  }
  let date =
    video.upload_date.slice(0, 4) +
    '/' +
    video.upload_date.slice(4, 6) +
    '/' +
    video.upload_date.slice(6, 8)
  return {
    id: video.id,
    title: video.title,
    channel: video.uploader,
    thumbnail: video.thumbnail,
    date,
    duration: video._duration_raw,
    progress: 0,
    settings: {},
    formats
  }
}

const VrtHandler = (video) => {
  const VideoFormats = ['DASH video']
  const AudioFormats = ['DASH audio']
  let formats = []
  for (let format of video.formats) {
    // eslint-disable-next-line camelcase
    let { ext, fps, filesize, format_note } = format
    if (VideoFormats.includes(format_note)) {
      formats.push({
        format_note: String(format.height) + 'p',
        ext,
        fps,
        id: format.format_id,
        filesize,
        type: 'video'
      })
    } else if (AudioFormats.includes(format_note)) {
      formats.push({
        format_note,
        ext,
        fps,
        id: format.format_id.split(' ')[0],
        filesize,
        type: 'audio'
      })
    }
  }

  return {
    id: video.id,
    title: video.title,
    channel: null,
    thumbnail: video.thumbnail,
    date: null,
    duration: video._duration_raw,
    progress: 0,
    settings: {},
    formats
  }
}

if (require.main === module) {
  const url =
    'https://www.youtube.com/watch?v=vJLxguyxNU0'
  GetInfo(url)
    .then((res) => {
      console.log(res)
      for (let format of res[0].formats) {
        console.log(format)
      }
    })
    .catch((err) => console.error(err))
}
export { GetInfo }
