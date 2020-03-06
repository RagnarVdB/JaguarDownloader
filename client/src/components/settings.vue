<template>
  <div id="settings">
    <info
      v-if="video.id"
      :video="video"
    />
    <setting
      v-if="video.id"
      :video="video" 
      @update-settings="(data) => {$emit('update-settings', data)}"
      @update-format="format_change"
    />
    <div
      v-if="video.id"
      id="size"
    >
      <p v-if="filesize">Estimated file size: {{ filesize }} </p>
    </div>
  </div>
</template>

<script>
import info from "./info"
import setting from "./setting"

export default {
  name: "Settings",
  components: {
    info,
    setting
  },
  props: ["video"],
  data(){
    return {
      filesize: 'unknown'
    }
  },
  computed: {
    convert: function(){
      return !this.video.mp4_resolutions.includes(this.video.settings.quality) && this.video.settings.ext === 'mp4';
    },
  },
  methods: {
    format_change() {
      // computes filesize on format change
      let filesize
      if (this.video.settings.hasOwnProperty('format') && this.video.settings.format.filesize){
        let format = this.video.settings.format;
        if (format.length === 1){
          filesize = Math.round(format[0].filesize / 1000000)
        } else {
          filesize = Math.round((format[0].filesize + format[1].filesize) /1000000)
        }
        this.filesize = `${filesize} MB`;
      }
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
  #size p{
    font-size: 0.9rem;
    color: var(--text-grey);
  }
</style>