<template>
  <div id="list">
    <div v-if="status === '' && !update" class="info">
      <p>
        Start adding videos by entering the url in the text field below.
        Then choose a destination folder and hit start in the bottom right
      </p>
    </div>
    <div v-if="update && status === ''" class="info" id="updateMessage">
      <p>An update is available! Start the update by clicking <button @click="OpenSite" class="link"><p>This link</p></button>.</p>
    </div>
    <addVideo
      ref="addVideo"
      @add-video="(data) => {$emit('add-video', data)}"
    />
    <div id="videowrapper">
      <div
        v-for="video in videos"
        id="items"
        :key="video.id"
      >
        <videoItem
          class="videoItem"
          :video="video"
          @current="$emit('change', video)"
          @del-video="$emit('del-video', video.id)"
          v-bind:current="current_id"
        />
      </div>
      <div v-if="status === 'FINISHED!' && this.videos.length===0" id="finished">
      <p>FINISHED!</p>
    </div>
    </div>
  </div>
</template>

<script>
import addVideo from './addVideo'
import videoItem from './videoItem'
const { shell } = require('electron')
export default {
  name: 'List',
  components: {
    addVideo,
    videoItem
  },
  props: ['videos', 'current_id', 'status', 'update'],
  methods: {
    setFocus () {
      setTimeout(() => document.getElementsByClassName('videoItem')[0].focus(), 100)
    },
    invalid (valid) {
      // displays error message when necessary
      this.$refs.addVideo.invalid(valid)
    },
    OpenSite () {
      shell.openExternal('https://jaguardownloader.netlify.com/#download')
    }
  }
}
</script>
<style scoped>

  /* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 15px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #999; 
}


  #list, #items{
    background-color: var(--main);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #items{
    width: 100%;
  }
  .info{
    width: 95%;
    margin-top: 10px;
  }
  .info p{
    font-size: 0.8rem;
    color: var(--text-grey);
  }
  #videowrapper{
    overflow: auto;
    flex-grow: 1;
    width: 100%;
    height: 0;
    margin-bottom: 10px;
  }
  #updateMessage p{
    color: white;
    font-size: 1rem;
  }
  #finished{
    margin-top: 100px;
    text-align: center;
  }
  #finished p{
    font-size: 2rem;
    color: var(--text-grey);
  }
 .link{
    border: none;
    background: none;
  }
  .link p{
    color: #0077FF;
    text-decoration: underline;
  }
  .link:hover{
    background-color: transparent;
  }
</style>