<template>
  <div id="list">
    <addVideo ref = "addVideo" v-on:add-video="(data) => {$emit('add-video', data)}" />
    <div id="items" v-for="video in videos" :key=video.id>
      <videoItem class="videoItem" v-bind:video="video" v-on:current="$emit('change', video)" v-on:del-video="$emit('del-video', video.id)" />
    </div>
  </div>
</template>

<script>
import addVideo from "./addVideo"
import videoItem from "./videoItem"
export default {
  name: "list",
  props: ["videos"],
  components: {
    addVideo,
    videoItem
  },
  methods: {
    setFocus(){
      setTimeout(() => document.getElementsByClassName('videoItem')[0].focus(), 100);
    },
    invalid(valid){
      // displays error message when necessary
      this.$refs.addVideo.invalid(valid);
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
</style>