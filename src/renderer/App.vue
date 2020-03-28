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
      folder: 'C:/users/',
      current: '', // currently selected video
      status: '',
      version: 0.1,
      update: false
    }
  },
  created: function () {
    window.addEventListener('beforeunload', () => {
      console.log('unloading')
      fetch('http://127.0.0.1:5000/close', {
        method: 'GET'
      })
    })

    fetch('http://127.0.0.1:5000/defaultpath', {
      method: 'GET'
    })
      .then((res) => res.json())
      .then((data) => {
        this.folder = data
      })
      .catch((error) => console.error(error))

    fetch('http://127.0.0.1:5000/version', {
      method: 'GET'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.version !== this.version) {
          this.update = true
        }
      })
      .catch((err) => {
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
    async start () {
      if (this.status === '' || this.status === 'ready to download') {
        this.status = 'downloading ...'
        let AllSettings = {}
        for (let video of this.videos) {
          AllSettings[video.id] = video.settings
        }
        this.$socket.emit('start', { settings: AllSettings, path: this.folder })
      }
    },
    set_folder () {
      document.getElementsByClassName('link')[0].style.cursor = 'wait'
      fetch('http://127.0.0.1:5000/directory', {
        method: 'GET'
      })
        .then((res) => res.json())
        .then((path) => {
          document.getElementsByClassName('link')[0].style.cursor = 'pointer'
          if (path.length > 2) {
            this.folder = path
          }
        })
        .catch((err) => alert(err))
    }
  },
  sockets: {
    connect: function () {
      console.log('socket connected!')
    },
    progress: function (data) {
      for (let id in data) {
        this.videos.forEach((video) => {
          if (video.id === id) {
            video.progress = data[id].progress
            this.status = data[id].status
            if (
              data[id].status === 'FINISHED!' &&
              this.videos.every((video) => video.progress === 100)
            ) {
              this.deleteVideo(id)
            }
          }
        })
      }
    },
    errorlog: function (data) {
      alert(`An error occurred: \n ${data.type}: ${data.msg}`)
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
