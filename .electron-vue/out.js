const fs = require('fs')
const https = require('https')
const path = require('path')
const { exec } = require('child_process')

const sitePath = 'C:/Users/ragna/Desktop/code/website/src'
const version_string = JSON.parse(fs.readFileSync('package.json')).version
const version = version_string.slice(1, version_string.length)
const build = path.join('build', `Jaguar Downloader Setup ${version}.exe`)

exec(`cd ${sitePath} && git add . && git commit -m "version ${version}" && git push`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`)
    return;
  }
  console.log(`stdout: ${stdout}`)
  console.error(`stderr: ${stderr}`)
})