'use strict'

const ytdl = require('youtube-dl')
const fs = require('fs')
if (!ytdl.getYtdlBinary().includes('unpacked')) {
  ytdl.setYtdlBinary(
    ytdl.getYtdlBinary().replace('app.asar', 'app.asar.unpacked')
  )
}

const GetInfo = (url) => {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, ['--yes-playlist'], (err, info) => {
      // console.log('info', info)
      if (err) {
        reject(new Error('This video may not be supported or something is wrong with your internet connection'))
        return
      }
      var infos = []
      if (Array.isArray(info) && info[0].extractor_key === 'Youtube') {
        for (let video of info) {
          infos.push(YoutubeHandler(video))
        }
      } else if (info.extractor_key === 'Youtube') {
        const formattedInfo = YoutubeHandler(info)
        if (formattedInfo) {
          infos.push(formattedInfo)
        }
      } else if (info.extractor_key === 'Canvas') {
        const formattedInfo = VrtHandler(info)
        if (formattedInfo) {
          infos.push(formattedInfo)
        }
      } else {
        reject(new Error('This site is not supported'))
        return
      }

      fs.writeFile('infos_vrt_encrypted.json', JSON.stringify(info), 'utf-8', err => console.log(err))
      // fs.writeFile('info.json', JSON.stringify(info), 'utf-8', err => console.error(err))
      if (infos.length === 0) {
        reject(new Error('This video is not available for download'))
      } else {
        resolve(infos)
      }
    })
  })
}

const YoutubeHandler = (video) => {
  let formats = []
  for (let format of video.formats) {
    const type = (format.vcodec !== 'none' && format.acodec !== 'none') ? 'both'
      : (format.vcodec !== 'none') ? 'video'
        : 'audio'

    formats.push({
      id: format.format.split(' ')[0],
      ext: format.ext,
      filesize: format.filesize,
      format_note: format.format_note,
      fps: format.fps,
      type
    })
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
    extractor: video.extractor_key,
    progress: 0,
    settings: {},
    formats
  }
}

const VrtHandler = (video) => {
  const VideoExtensions = ['mp4', 'mkv']
  const AudioExtensions = ['mp3', 'm4a']
  let formats = []
  for (let format of video.formats) {
    console.log(format)
    console.log(format.format_note)
    // eslint-disable-next-line camelcase
    const { ext, fps, filesize, format_note } = format
    const type = (format.vcodec !== 'none' && format.acodec !== 'none') ? 'both'
      : (format.vcodec !== 'none') ? 'video'
        : 'audio'
    if (VideoExtensions.includes(ext)) {
      formats.push({
        format_note: String(format.height) + 'p',
        ext,
        fps,
        id: format.format_id,
        filesize,
        type
      })
    } else if (AudioExtensions.includes(ext)) {
      formats.push({
        format_note,
        ext,
        fps,
        id: format.format_id.split(' ')[0],
        filesize,
        type
      })
    }
  }
  if (formats.length !== 0) {
    return {
      id: video.id,
      title: video.title,
      channel: null,
      thumbnail: video.thumbnail,
      date: null,
      duration: video._duration_raw,
      extractor: video.extractor_key,
      progress: 0,
      settings: {},
      formats
    }
  } else {
    return null
  }
}

if (require.main === module) {
  const url =
    'https://www.vrt.be/vrtnu/a-z/chernobyl/1/chernobyl-s1a2/'
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
