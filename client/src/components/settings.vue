<template>
  <div id="settings">
    <info v-bind:video = "video" v-if="video.id" />
    <setting v-bind:video = "video" v-if="video.id"/>
  </div>
</template>

<script>
import info from "./info"
import setting from "./setting"

export default {
  name: "settings",
  components: {
    info,
    setting
  },
  props: ["video"]
}
</script>
<style scoped>
  #settings{
    background-color: var(--main);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
  }
</style>