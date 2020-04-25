const { getYtdlBinary } = require('youtube-dl')
const ytdlPath = getYtdlBinary()
const { spawn } = require('child_process')

const secondStream = spawn(ytdlPath, ['--newline', '-f', 'MPEG_DASH-audio=96001', '--output', 'C:/Users/ragna/Desktop/test.m4a', 'https://www.vrt.be/vrtnu/a-z/de-ideale-wereld/2020-vj/de-ideale-wereld-d20200421/#autoplay=679&asset=/content/dam/vrt/2020/04/21/diw-200421-arvato_30225015'])
secondStream.stderr.on('data', data => {
  console.log(`stderr: ${data}`)
})

secondStream.on('error', (error) => {
  console.log(`error: ${error.message}`)
  console.error(error.message)
})

secondStream.on('close', code => {
  console.log(`child process exited with code ${code}`)
})

secondStream.stdout.on('data', data => {
  console.log(String(data))
})
