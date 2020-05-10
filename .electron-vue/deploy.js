const fs = require('fs')
const https = require('https')
const path = require('path')
const request = require('request')
const { exec } = require('child_process')

const sitePath = 'C:/Users/ragna/Desktop/code/website/src'
const version_string = JSON.parse(fs.readFileSync('package.json')).version
const version = version_string.slice(1, version_string.length)
const build = path.join('build', `Jaguar Downloader Setup ${version}.exe`)
// update version number
fs.writeFileSync(path.join(sitePath, 'version.json'), JSON.stringify({version}))

// upload the installer
const req = request.post('https://api.anonfile.com/upload', (err, resp, body) => {
  if (err) {
    console.log('Error!')
  } else {
    console.log(body)
    const link = JSON.parse(body).data.file.url.full
    console.log(link)
    const links = 
    `const URLs = {
      "windows": "${link}",
      "code": "https://github.com/RagnarVdB/JaguarDownloader/archive/master.zip"
    }`
    fs.writeFileSync(path.join(sitePath, 'links.js'), links)
      }
    })

    // push to github
    exec(`cd ${sitePath} && git add . && git commit -m "version ${version}" && git push`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    })
const form = req.form()
form.append('file', fs.createReadStream(build))
