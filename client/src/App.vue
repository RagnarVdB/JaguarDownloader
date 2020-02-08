<template>
  <div id="app">
    <list v-bind:videos = "videos" v-on:change="changeCurrent" v-on:del-video="deleteVideo" v-on:add-video="addVideo"/>
    <settings v-bind:video = "current" />
    <general v-bind:folder = "folder"/>
  </div>
</template>

<script>
import list from './components/list.vue'
import settings from './components/settings.vue'
import general from './components/general.vue'

export default {
  name: 'app',
  components: {
    list,
    settings,
    general
  },
  data(){
    return{
      videos: [
        {
          id: 1,
          title: "Video1",
          channel: "Channel1",
          date: "30/01/2020",
          thumbnail: "../assets/thumbnail.jpg",
          progress: "50",
          settings: {
            ext: "mkv",
            type: "video",
            quality: "1080p"
          }
        },
        {
          id: 2,
          title: "A very very very veeeeeeery long title",
          channel: "Channel2",
          date: "30/01/2020",
          thumbnail: "../assets/thumnail.jpg",
          progress: "30",
          settings: {
            ext: "m4a",
            type: "audio",
            quality: "256kbps"
          }
        }
      ],
      current: {},
      folder: "C:/users/"
    }
  },
  methods: {
    changeCurrent(video){
    this.current = video;
    },
    deleteVideo(id){
      this.videos = this.videos.filter(video => video.id !== id);
    },
    addVideo(newVideo){
      this.videos = [...this.videos, newVideo]
    }
  }
}
</script>

<style>
:root{
  --main: #232323;
  --text-grey: #A9A9A9;
}


*{
  margin: 0;
  padding: 0;
  color: white;
}

button, .button{
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
.link{
  color: blue;
}
button:hover, .button:hover{
  background-color: white;
  color: black;
  transition: 0.3s ease;
}
</style>
