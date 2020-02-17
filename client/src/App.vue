<template>
  <div id="app">
    <list
      ref="listRef" 
      :videos="videos"
      @change="changeCurrent"
      @del-video="deleteVideo"
      @add-video="addVideo"
    />
    <settings
      :video="current"
      @update-settings="update_settings"
    />
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
  data(){
    return{
      videos: [],
      folder: "C:/users/",
      current: '', //currently selected video
      status: ''
    }
  },
  created: function(){
    fetch('http://127.0.0.1:5000/defaultpath', {
      method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
      this.folder = data;
    })
    .catch(error => console.log(error))
  },
  methods: {
    changeCurrent(video){
    this.current = video;
    },
    deleteVideo(id){
      this.videos = this.videos.filter(video => video.id !== id);
      if (this.current.id === id){
        this.current = ''
      }
    },
    addVideo(newVideos){
      this.status = 'ready to download';
      //adds videos that aren't in the list yet
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
    },
    async start(){
      if (this.status === '' || this.status === 'ready to download'){
        let all_settings = {};
        for (let video of this.videos){
          all_settings[video.id] = video.settings;
        }
        this.$socket.emit('start', {settings: all_settings, path: this.folder})
      }
    },
    set_folder(){
      document.getElementsByClassName('link')[0].style.cursor = 'wait';
      fetch('http://127.0.0.1:5000/directory', {
        method: 'GET'
      })
      .then(res => res.json())
      .then(path => {
        document.getElementsByClassName('link')[0].style.cursor = 'pointer';
        console.log(path)
        if (path.length > 2){
          this.folder = path
        }
      })
      .catch(err => alert(err))
    }
  },
  sockets: {
    connect: function(){
      console.log('socket connected!');
    },
    progress: function(data){
      console.log('received!');
      for (let id in data){
        this.videos.forEach((video) => {
          if (video.id === id){
            video.progress = data[id].progress;
            this.status = data[id].status;
            if (data[id].status === 'FINISHED!'){
              this.deleteVideo(id);
            }
          }
        })
      }
    },
    errorlog: function(data){
      console.log('received', data);
      alert(`An error occurred: \n ${data.type}: ${data.msg}`)
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
  width: auto !important; 
}
button:hover, .button:hover{
  background-color: white;
  color: black;
  transition: 0.3s ease;
}
</style>