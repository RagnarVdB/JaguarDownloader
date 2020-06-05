const request = require('request')
const fs = require('fs')

function getToken () {
  return new Promise((resolve, reject) => {
    const clientId = fs.readFileSync('./src/client_id.txt')
    const clientSecret = fs.readFileSync('./src/client_secret.txt')
    const str = clientId + ':' + clientSecret
    const auth = (Buffer.alloc(str.length, str).toString('base64'))
    const options = {
      'method': 'POST',
      'url': 'https://accounts.spotify.com/api/token',
      'headers': {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        'grant_type': 'client_credentials'
      }
    }
    request(options, function (error, response) {
      if (error) reject(error)
      else if (response.body) {
        const result = JSON.parse(response.body)
        if (result.hasOwnProperty('access_token')) {
          console.log(result.access_token)
          resolve(result.access_token)
        } else {
          reject(new Error('couldn\'t get valid access token'))
        }
      }
    })
  })
}

function getMetadata (token, track, artist = null, album = null) {
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.spotify.com/v1/search')
    let q = track
    if (artist) q += ', ' + artist
    if (album) q += ', ' + album
    url.searchParams.append('q', q)
    url.searchParams.append('type', 'track')
    url.searchParams.append('limit', '10')
    const options = {
      'method': 'GET',
      'url': url.toString(),
      'headers': {
        'Authorization': 'Bearer ' + token
      }
    }
    request(options, (error, response) => {
      if (error) reject(error)
      else if (response.body) {
        const items = JSON.parse(response.body).tracks.items
        resolve(items.map(item => ({
          'title': item.name,
          'artist': item.artists.map(artist => artist.name).join(' / '),
          'album': item.album.name,
          'album_artists': item.album.artists.map(artist => artist.name).join(' / '),
          'date': item.album.release_date,
          'track': item.track_number,
          'disk': item.disc_number,
          'cover_url': item.album.images[0].url
        })))
      } else {
        reject(new Error('couldn\'t get track info'))
      }
    })
  })
}

// getToken()
//   .then(token => getMetadata(token, 'Burn The Witch', 'Radiohead'))
//   .then(res => console.log(res))
//   .catch(err => console.error(err))

// getMetadata('BQBv4U6EWdp5SqxnoenISwnoZNVTg8Yf0DOD8_jqXNfqPbgaqBgdF5KyRtBf-MJ8kWlfxiHT8Qi_kvOW1So', 'Burn The Witch', 'Radiohead')

export { getToken, getMetadata }
