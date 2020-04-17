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

const urllib = require('urllib')
const os = require('os')
const path = require('path')
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
      version: 0.3,
      update: false
    }
  },
  created: function () {
    urllib.request('https://jaguardownloader.netlify.com/version.json')
      .then(result => {
        let data = JSON.parse(result.data.toString())
        if (data.version > this.version) {
          this.update = true
        }
      })
      .catch(function (err) {
        console.error(err)
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
          console.log(video.url, video.settings, this.folder)
          downloader(video.url, video.settings, this.folder, (status, progress) => {
            console.log(`${status}: ${progress}`)
            video.progress = progress
            this.status = status
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
