<template>
  <div id="app">
    <list v-bind:videos = "videos" ref="listRef" v-on:change="changeCurrent" v-on:del-video="deleteVideo" v-on:add-video="addVideo"/>
    <settings v-bind:video = "current" v-on:update-settings="update_settings"/>
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
      videos: [],
      folder: "C:/users",
      current: ''
    }
  },
  methods: {
    changeCurrent(video){
    this.current = video;
    },
    deleteVideo(id){
      this.videos = this.videos.filter(video => video.id !== id);
    },
    addVideo(newVideos){
      //console.log(JSON.stringify(newVideos));
      if (newVideos.length !== 0){
        newVideos = newVideos.filter((newVideo) => {
        let video;
        for (video of this.videos){
          if (video.id === newVideo.id){
            return false;
            }
          }
        return true
        });

        this.videos = newVideos.concat(this.videos);
        this.current = newVideos[0];
        this.$refs.listRef.setFocus();
        this.$refs.listRef.invalid(true);
      } else {
        this.$refs.listRef.invalid(false);
      }
    },
    update_settings(data){
      this.videos.forEach((video) => {
        if (video.id === data.id){
          for (let property in data){
            if (property !== 'id'){
              video.settings[property] = data[property];
            }
          }
        }
      })
    }
  },
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