<template>
  <div id="list">
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
      />
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
  props: ["videos"],
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