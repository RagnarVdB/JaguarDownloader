<template>
  <div id="app">
    <list
      ref="listRef"
      :videos="videos"
      :status="status"
      :update="update"
      @change="changeCurrent"
      @del-video="deleteVideo"
      @add-video="addVideo"
      v-bind:current_id="current.id"
    />
    <settings :video="current" @update-settings="update_settings" />
    <general
      :folder="folder"
      :status="status"
      @start="start"
      @set-folder="set_folder"
    />
  </div>
</template>

<script>
import list from './components/list.vue'
import settings from './components/settings.vue'
import general from './components/general.vue'
import downloader from './functions/downloader'
import { spawn } from 'child_process'
import urllib from 'urllib'
import os from 'os'
import path from 'path'
import { getYtdlBinary, setYtdlBinary } from 'youtube-dl'
const { dialog } = require('electron').remote

export default {
  name: 'App',
  components: {
    list,
    settings,
    general
  },
  data () {
    return {
      videos: [],
      folder: path.join(os.homedir(), 'downloads'),
      current: '', // currently selected video
      status: '',
      version: '0.3.2',
      update: false
    }
  },
  created: function () {
    urllib.request('https://jaguardownloader.netlify.app/version.json')
      .then(result => {
        const versionCompare = (v1, v2) => {
          const v1Array = v1.split('.')
          const v2Array = v2.split('.')
          let larger = false
          for (let i = Math.max(v1Array.length, v2Array.length); i--; 0) {
            console.log(v2Array[i] > v1Array[i])
            if (v2Array[i] > v1Array[i]) {
              larger = true
            } else if (v2Array[i] < v1Array[i]) {
              larger = false
            }
          }
          return larger
        }
        let data = JSON.parse(result.data.toString())
        console.log(data.version)
        if (versionCompare(String(this.version), String(data.version))) {
          console.log('update')
          this.update = true
        }
      })
      .catch(function (err) {
        console.error(err)
      })
    // Try to update Youtube-dl binary
    if (!getYtdlBinary().includes('unpacked')) {
      setYtdlBinary(
        getYtdlBinary().replace('app.asar', 'app.asar.unpacked')
      )
    }
    const ytdlPath = getYtdlBinary()
    const update = spawn(ytdlPath, ['-U'])
    update.stdout.on('data', msg => {
      console.log(String(msg))
    })
  },
  methods: {
    changeCurrent (video) {
      this.current = video
    },
    deleteVideo (id) {
      this.videos = this.videos.filter((video) => video.id !== id)
      if (this.current.id === id) {
        this.current = ''
      }
    },
    addVideo (newVideos) {
      this.status = 'ready to download'
      // adds videos that aren't in the list yet
      if (newVideos.length !== 0) {
        newVideos = newVideos.filter((newVideo) => {
          let video
          for (video of this.videos) {
            if (video.id === newVideo.id) {
              return false
            }
          }
          return true
        })

        this.videos = newVideos.concat(this.videos)
        this.current = newVideos[0]
        this.$refs.listRef.setFocus()
        this.$refs.listRef.invalid(true)
      } else {
        this.$refs.listRef.invalid(false)
      }
    },
    update_settings (data) {
      this.videos.forEach((video) => {
        if (video.id === data.id) {
          for (let property in data) {
            if (property !== 'id') {
              video.settings[property] = data[property]
            }
          }
        }
      })
    },
    start () {
      if (this.status === '' || this.status === 'ready to download') {
        this.status = 'downloading ...'
        for (let video of this.videos) {
          downloader(video.url, video.settings, this.folder, (status, progress) => {
            console.log(`${status}: ${progress}`)
            video.progress = progress
            this.status = status
            if (status === 'FINISHED!' && progress === 100) {
              console.log('removing video')
              this.deleteVideo(video.id)
            }
          },
          (err) => {
            dialog.showErrorBox(`Something went wrong downloading '${video.title}'`,
              `${err} `)
          })
        }
      }
      // const video = this.videos[0]
      // fs.writeFile('setting.json', JSON.stringify({...video.settings, id: video.id}), 'utf-8', err => console.log(err))
    },
    set_folder (dir) {
      this.folder = dir
    }
  }
}
</script>

<style>
:root {
  --main: #232323;
  --text-grey: #a9a9a9;
}

* {
  margin: 0;
  padding: 0;
  color: white;
}

button,
.button {
  cursor: pointer;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: black;
  display: grid;
  grid-template-columns: 65fr 35fr;
  grid-template-rows: 10fr 1fr;
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);
  grid-gap: 10px;
  padding: 10px;
}
.link {
  color: blue;
  width: auto !important;
}
button:hover,
.button:hover {
  background-color: white;
  color: black;
  transition: 0.3s ease;
}
</style>
