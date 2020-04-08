<template>
  <div id='addVideo'>
    <form @submit='addVideo'>
      <label for='add video'>ADD URL</label>
      <input
        id='url_input'
        v-model='url'
        type='text'
        placeholder='enter url'
      >
      <input
        class='button'
        type='submit'
        value='enter'
      >
      <div class='lds-ellipsis'>
        <div /><div /><div /><div />
      </div>
    </form>
    <div id='invalid'>
      <p>Something went wrong! Check your internet connection or the url.</p>
    </div>
    <div id='playlist'>
      <p>Playlist detected! Do you want to download the entire playlist?</p>
      <button @click='yes'>
        YES
      </button>
      <button @click='no'>
        NO
      </button>
    </div>
  </div>
</template>

<script>
// const ydl = require('youtube-dl')
import { GetInfo } from '../functions/infogetter'
export default {
  name: 'AddVideo',
  data () {
    return {
      url_playlist: '',
      videos: [],
      url: ''
    }
  },
  methods: {
    addVideo (event) {
      event.preventDefault()
      var animation = document.getElementsByClassName('lds-ellipsis')[0]
      animation.style.display = 'inline-block'
      GetInfo(this.url)
        .then(data => {
          data.forEach(el => {
            el.settings = {
              ext: 'mkv',
              type: 'video',
              tag: false,
              tags: {},
              filename: el.title.replace(/[/\\?%*:|"<>]/g, ''),
              duration: el.duration,
              extractor: el.extractor
            }
            el.filesize = 'unknown'
            el.resolutions = []
            el.status = 'ready to download'
            el.progress = 0
            el.formats.forEach(format => {
              if (!el.resolutions.includes(format.format_note) && format.type === 'video') {
                el.resolutions.push(format.format_note)
              }
            })
            if (el.resolutions.includes('1080p')) {
              el.settings.quality = '1080p'
            } else {
              el.settings.quality = el.resolutions[el.resolutions.length - 1]
            }
          })
          // stop loading animation
          animation.style.display = 'none'
          if (data.length > 1) {
            // playlist: show buttons
            let wrapper = document.getElementById('addVideo')
            let playlist = document.getElementById('playlist')
            wrapper.style.height = '90px'
            playlist.style.display = 'flex'
            this.url_playlist = this.url
            this.videos = data
          } else {
            this.$emit('add-video', data)
          }
        })
        .catch(err => console.error(err))
    },
    yes () {
      this.$emit('add-video', this.videos)
      document.getElementById('addVideo').style.height = '50px'
      document.getElementById('playlist').style.display = 'none'
    },
    no () {
      let index = this.url_playlist.charAt(this.url_playlist.length - 1)
      if (isNaN(index)) {
        index = 0
      }
      this.$emit('add-video', [this.videos[index - 1]])
      document.getElementById('addVideo').style.height = '50px'
      document.getElementById('playlist').style.display = 'none'
    },
    invalid (valid) {
      let wrapper = document.getElementById('addVideo')
      let message = document.getElementById('invalid')
      if (valid) {
        message.style.display = 'none'
        wrapper.style.height = '50px'
      } else {
        message.style.display = 'block'
        wrapper.style.height = '80px'
      }
    }
  }
}
</script>

<style scoped>
  #addVideo{
    width: 97%;
    height: 50px;
    margin-top: 15px;
    background-color: black;
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;

  }
  form{
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-self: flex-start;
  }
  label{
    color: white;
    margin-left: 20px;
    margin-right: 15px;
    width: 6rem;
    font-size: 0.8rem;
  }
  #url_input{
    width: 100%;
    background-color: var(--main);
    border: 1px solid #707070;
    color: white;
  }
  .button{
    border: 1px solid white;
    background-color: transparent;
    color: white;
    border-radius: 12px;
    padding: 5px;
    margin-left: 20px;
    margin-right: 20px;
    width: 90px;
    font-size: 0.8rem;
  }
  .button:hover{
    background-color: white;
    color: black;
  }
  #invalid{
    margin-left: 100px;
    margin-bottom: 10px;
    display: none;
  }
  #invalid p{
    color: red;
    font-size: 0.8rem;
  }
  #playlist{
    width: 100%;
    display: none;
    flex-direction: row;
    margin-bottom: 10px;
    align-items: center;
    justify-content: space-evenly;
  }
  #playlist p{
    font-size: 0.9rem;
  }
  #playlist button{
    width: 70px;
    height: 25px;
    border-radius: 15px;
    font-size: 0.8rem;
    background-color: transparent;
    border: 1px solid white;
    color: white;
  }
  #playlist button:hover{
    background-color: white;
    color: black;
  }

  .lds-ellipsis {
    display: none;
    position: relative;
    width: 40px;
    height: 40px;
    left: 0;
    margin-right: 23px;
  }
  .lds-ellipsis div {
    position: absolute;
    top: 16px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 4px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 4px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 16px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 28px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
    transform: scale(0);
    }
    100% {
    transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
    transform: scale(1);
    }
    100% {
    transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
    transform: translate(0, 0);
    }
    100% {
    transform: translate(12px, 0);
    }
  }

  
</style>