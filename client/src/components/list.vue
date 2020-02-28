<template>
  <div id="list">
    <div v-if="status === '' && !update" class="info">
      <p>
        Start adding videos by entering the url in the text field below.
        Then choose a destination folder and hit start in the bottom right
      </p>
    </div>
    <div v-if="update && status === ''" class="info">
      <p>An update is available! Start the update by clicking <a href="https://jaguardownloader.netlify.com/#download" target="_blank" @click="closer">this link</a>.</p>
    </div>
    <addVideo
      ref="addVideo"
      @add-video="(data) => {$emit('add-video', data)}"
    />
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
</template>

<script>
import addVideo from "./addVideo"
import videoItem from "./videoItem"
export default {
  name: "List",
  components: {
    addVideo,
    videoItem
  },
  props: ["videos", "current_id", "status", "update"],
  methods: {
    setFocus(){
      setTimeout(() => document.getElementsByClassName('videoItem')[0].focus(), 100);
    },
    invalid(valid){
      // displays error message when necessary
      this.$refs.addVideo.invalid(valid);
    },
    closer(){
      console.log('closing')
      fetch('http://127.0.0.1:5000/close', {
        method: 'GET'
        });
    }
  }
}
</script>
<style scoped>
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
  #finished{
    margin-top: 100px;
  }
  #finished p{
    font-size: 2rem;
    color: var(--text-grey);
  }
</style>