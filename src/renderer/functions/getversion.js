const urllib = require('urllib')

urllib.request('https://jaguardownloader.netlify.com/version.json')
  .then(result => {
    // result: {data: buffer, res: response object}
    let data = JSON.parse(result.data.toString())
    console.log(data.version)
  })
  .catch(function (err) {
    console.error(err)
  })
