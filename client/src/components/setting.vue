<template>
  <div id="setting">
    <form id="general">
      <div>
        <p>filename: </p>
        <input type="text" v-model="video.settings.filename">
      </div>
      <div>
        <p>format: </p>
        <select id="format" v-model="video.settings.ext">
          <option value="mkv">mkv</option>
          <option value="mp4">mp4</option>
          <option value="m4a">m4a</option>
          <option value="mp3">mp3</option>
        </select>
      </div>
      <div v-if="!['mp3', 'm4a'].includes(video.settings.ext)">
        <p>resolution: </p>
        <select id="resolution" v-model="video.settings.quality">
          <option v-for="resolution in video.resolutions" :key="resolution" v-bind:value="resolution">{{resolution}}</option>
        </select>
      </div>
    </form>
    <div id="convert" v-if="convert">
      <p>The requested format is unavailable. The video will be downloaded as mkv and converted into {{video.settings.ext}}. This may take a long time</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "setting",
  props: ["video"],
  computed: {
    convert: function(){
      return !this.video.mp4_resolutions.includes(this.video.settings.quality) && this.video.settings.ext === 'mp4';
    },
    format_id: function(){
      return 1;
    }
  }
}
</script>

<style scoped>
p {
  color: var(--text-grey);
  font-size: 0.7rem;
}
#setting{
  border: 1px solid #535353;
  width: 97%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 2.5%;
  margin-top: 15px;
}
#general{
  display: flex;
  flex-direction: column;
}
#general div{
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;

}
#general input, #general select{
  width: 200px;
  padding: 0;
  border: 1px solid #393939;
  background-color: black;
  margin-left: 20px;
}
#general select{
  width: 202px;
}
#convert{
  margin-top: 20px;
}

</style>