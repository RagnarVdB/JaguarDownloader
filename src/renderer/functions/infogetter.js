const ytdl = require('youtube-dl')

const GetInfo = (url) => {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url, ['--yes-playlist'], (err, info) => {
      if (err) reject(err)
      var infos = []
      if (Array.isArray(info) && info[0].extractor_key === 'youtube') {
        for (let video of info) {
          infos.push(GetUsefulInfo(video))
        }
      } else if (info.extractor_key === 'youtube') {
        infos.push(GetUsefulInfo(info))
      } else if (info.extractor_key === 'Canvas') {
        infos.push(GetVrtInfo(info))
      }

      // fs.writeFile('infos.json', JSON.stringify(infos), 'utf-8', err => console.log(err))
      // fs.writeFile('info.json', JSON.stringify(info), 'utf-8', err => console.error(err))
      if (infos.length === 0) reject(err)
      resolve(infos)
    })
  })
}

const GetUsefulInfo = (video) => {
  const VideoFormats = ['144p', '240p', '360p', '480p', '720', '1080p', '1440p', '2160p', 'DASH video']
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
  let date = video.upload_date.slice(0, 4) + '/' + video.upload_date.slice(4, 6) + '/' + video.upload_date.slice(6, 8)
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

const GetVrtInfo = (video) => {
  return {
    id: video.id,
    title: video.title,
    channel: null,
    thumbnail: video.thumbnail,
    date: null,
    duration: video._duration_raw,
    progress: 0,
    settings: {}
    // formats
  }
}

export { GetInfo }
