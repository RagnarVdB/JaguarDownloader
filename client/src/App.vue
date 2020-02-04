<template>
  <div id="app">
    <list v-bind:videos = "videos"/>
    <settings/>
    <general/>
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
          progress: "30",
          settings: {
            ext: "m4a",
            type: "audio",
            quality: "256kbps"
          }
        }
      ],
      folder: "C:/users/"
    }
  }
}
</script>

<style>
:root{
  --main: #232323;
}


*{
  margin: 0;
  padding: 0;
  color: white;
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
</style>
