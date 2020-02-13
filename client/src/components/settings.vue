<template>
  <div id="settings">
    <info v-bind:video = "video" v-if="video.id"/>
    <setting v-bind:video = "video" v-if="video.id" 
    v-on:update-settings="(data) => {$emit('update-settings', data)}"
    v-on:update-format="format_change"/>
    <div v-if="video.id">
      <p>Estimated filesize: {{filesize}} </p>
    </div>
  </div>
</template>

<script>
import info from "./info"
import setting from "./setting"

export default {
  name: "settings",
  data(){
    return {
      filesize: 'unknown'
    }
  },
  components: {
    info,
    setting
  },
  props: ["video"],
  computed: {
    convert: function(){
      return !this.video.mp4_resolutions.includes(this.video.settings.quality) && this.video.settings.ext === 'mp4';
    },
  },
  methods: {
    format_change(val) {
      console.log(val);
      let filesize
      if (this.video.settings.hasOwnProperty('format')){
        console.log('working'); 
        let format = this.video.settings.format;
        if (format.length === 1){
          filesize = Math.round(format[0].filesize / 1000000)
        } else {
          filesize = Math.round((format[0].filesize + format[1].filesize) /1000000)
        }
      } else {
        filesize = 'unknown';
      }
      this.filesize = `${filesize} MB`;
    }
  }
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