<template>
  <div id="setting">
    <form id="general">
      <div>
        <p>filename: </p>
        <input type="text" v-model="video.settings.filename">
      </div>
      <div>
        <p>format: </p>
        <select id="format" v-model="ext">
          <option value="mkv">mkv</option>
          <option value="mp4">mp4</option>
          <option value="m4a">m4a</option>
          <option value="mp3">mp3</option>
        </select>
      </div>
      <div v-if="!audio">
        <p>resolution: </p>
        <select id="resolution" v-model="resolution" >
          <option v-for="resolution in video.resolutions" :key="resolution" v-bind:value="resolution">{{resolution}}</option>
        </select>
      </div>
      <div v-if="audio" id="checkbox_tags">
        <p>include mp3 tags</p>
        <input type="checkbox" v-model="tag">
      </div>
    </form>
    <form id="tags" v-if="video.settings.tag && audio">
      <div v-for="el in ['title', 'artist', 'album', 'year', 'genre', 'album artist' ]" :key=el>
        <p>{{el}}: </p>
        <input type="text" v-model="video.settings.tags[el]">
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
    audio: function(){
      return ['mp3', 'm4a'].includes(this.video.settings.ext)
    },
    filename: {
      get(){
        return this.video.settings.filename;
      },
      set(val){
        this.$emit('update-settings', {id: this.video.id, filename: val});
      }
    },
    ext: {
      get(){
        return this.video.settings.ext;
      },
      set(val){
        this.$emit('update-settings', {id: this.video.id, ext: val});
      }
    },
    resolution: {
      get(){
        return this.video.settings.quality;
      },
      set(val){
        this.$emit('update-settings', {id: this.video.id, quality: val});
      }
    },
    tag: {
      get(){
        return this.video.settings.tag;
      },
      set(val){
        this.$emit('update-settings', {id: this.video.id, tag: val});
      }
    },
    tags: {
      get(){
        return this.video.settings.tags;
      },
      set(val){
        this.$emit('update-settings', {id: this.video.id, tags: val});
      }
    },
    format(){
      return this.ext, this.resolution;
    }
  },
  watch: {
    format(){
      this.formatter();
    }
  },
  methods: {
    formatter(){
      console.log('watching');
      
      let formats = []
      const extentions = {
        mkv: "webm",
        mp4: "mp4",
        m4a: "m4a",
        mp3: "mp3"
      }
      let max = 0;
      let format;
      for (format of this.video.formats){
        //set video format
        if (this.convert){
          if (format.format_note === this.video.settings.quality){
            formats[0] = format;
          }
        } else {
          if (format.format_note === this.video.settings.quality && extentions[this.video.settings.ext] === format.ext){
            formats[0] = format;
          }
        }
        
        //set audio format
        if (format.type === 'audio' && format.filesize > max){
          max = format.filesize;
          formats[1] = format;
        }
      }
      this.$emit('update-settings', {id: this.video.id, format: formats});
      this.$emit('update-format', 'testing');
    }
  },
  created(){
    this.formatter();
  }
}
</script>

<style scoped>
#checkbox_tags{
  justify-content: flex-start;
}
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
  height: 100%;
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
#checkbox_tags{
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
#checkbox_tags input{
  border: none;
  background-color: black;
  width: 20px;
}
#tags{
  display: flex;
  width: 100%;
  align-content: flex-start;
  height: 100%;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin-top: 20px;
}
#tags div {
  width: 40%;
}
#tags div input{
  border: none;
  background-color: black;
  width: 100%;
}

</style>