<template>
  <div id="setting">
    <form id="general">
      <div>
        <p>Filename: </p>
        <input
          v-model="video.settings.filename"
          type="text"
        >
        <img src="static/info.svg" alt="info" class="info" id="filename" @mouseover="over('filenametext')" @mouseout="out('filenametext')">
      </div>
      <div>
        <p>Format: </p>
        <select
          id="format"
          v-model="ext"
        >
          <option value="mkv">
            mkv
          </option>
          <option value="mp4">
            mp4
          </option>
          <option value="m4a">
            m4a
          </option>
          <option value="mp3">
            mp3
          </option>
        </select>
        <img src="static/info.svg" alt="info" class="info" id="ext" @mouseover="over('exttext')" @mouseout="out('exttext')">
      </div>
      <div v-if="type === 'video' " class="tooltip">
        <p>Resolution: </p>
        <select
          id="resolution"
          v-model="resolution"
        >
          <option
            v-for="resolution in video.resolutions"
            :key="resolution"
            :value="resolution"
          >
            {{ resolution }}
          </option>
        </select>
        <img src="static/info.svg" alt="info" class="info" id="res" @mouseover="over('restext')" @mouseout="out('restext')">
      </div>
      <div id="tooltiptexts">
        <p id="filenametext">Enter the filename without the extension</p>
        <p id="exttext">The extension of the file. Mkv and mp4 are video formats, m4a and mp3 contain audio only. Mp4 and mp3 have better compatibility, while mkv and m4a preserve better quality.</p>
        <p id="restext">The quality of the video, higher resolution means higher quality but a larger filesize. 1080p is recommended for most displays.</p>
      </div>
      <div
        v-if="type === 'audio'"
        id="checkbox_tags"
      >
        <p>Include mp3 tags</p>
        <input
          v-model="tag"
          type="checkbox"
        >
      </div>
      <p class="tooltiptext"></p>
    </form>
    <form
      v-if="video.settings.tag && type === 'audio'"
      id="tags"
    >
      <div
        v-for="el in ['title', 'artist', 'album', 'year', 'genre', 'album artist' ]"
        :key="el"
      >
        <p>{{ el }}: </p>
        <input
          v-model="video.settings.tags[el]"
          type="text"
        >
      </div>
    </form>
    <div
      v-if="this.video.settings.convert"
      id="convert"
    >
      <p>The requested format is unavailable. The video will be downloaded as mkv and converted into {{ video.settings.ext }}. This may take a long time depending on the size of the video.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Setting',
  props: ['video'],
  computed: {
    type: function () {
      if (['mp3', 'm4a'].includes(this.video.settings.ext)) {
        return 'audio'
      } else {
        return 'video'
      }
    },
    filename: {
      get () {
        return this.video.settings.filename
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, filename: val})
      }
    },
    ext: {
      get () {
        return this.video.settings.ext
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, ext: val})
      }
    },
    resolution: {
      get () {
        return this.video.settings.quality
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, quality: val})
      }
    },
    tag: {
      get () {
        return this.video.settings.tag
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, tag: val})
      }
    },
    tags: {
      get () {
        return this.video.settings.tags
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, tags: val})
      }
    },
    format () {
      return [this.ext, this.resolution]
    }
  },
  watch: {
    format () {
      // watching computed property, depending on ext and resolution for reactivity
      this.formatter()
    }
  },
  created () {
    this.formatter()
  },
  methods: {
    formatter () {
      const preferred = {
        mkv: ['webm', 'mkv'],
        mp4: ['mp4', 'm4a'],
        m4a: ['m4a'],
        mp3: ['mp3']
      }

      const compatible = {
        mkv: ['webm', 'mkv', 'mp4', 'm4a', 'mp3'],
        mp4: ['mp4', 'm4a'],
        m4a: ['m4a'],
        mp3: ['mp3']
      }
      const selectedFormats = []
      let convert = false

      if (this.type === 'video') {
        // set video format
        let preferredFormat = null
        let compatibleFormat = null
        let incompatibleFormat = null
        for (const format of this.video.formats) {
          if (preferred[this.ext].includes(format.ext) && format.format_note === this.video.settings.quality && format.type !== 'audio') {
            preferredFormat = format
          } else if (compatible[this.ext].includes(format.ext) && format.format_note === this.video.settings.quality && format.type !== 'audio') {
            compatibleFormat = format
          } else if (format.format_note === this.video.settings.quality && format.type !== 'audio') {
            incompatibleFormat = format
          }
        }
        if (preferredFormat) {
          selectedFormats.push(preferredFormat)
        } else if (compatibleFormat) {
          selectedFormats.push(compatibleFormat)
        } else {
          selectedFormats.push(incompatibleFormat)
          convert = true
        }
      }

      if (this.type === 'audio' || (selectedFormats.length === 1 && selectedFormats[0].type !== 'both')) {
        // set audio
        let preferredFormat = null
        let compatibleFormat = null
        let incompatibleFormat = null
        for (const format of this.video.formats) {
          if (format.type === 'audio' && preferred[this.ext].includes(format.ext)) {
            preferredFormat = format
          } else if (format.type === 'audio' && compatible[this.ext].includes(format.ext)) {
            compatibleFormat = format
          } else if (format.type === 'audio') {
            incompatibleFormat = format
          }
        }
        if (preferredFormat) {
          selectedFormats.push(preferredFormat)
        } else if (compatibleFormat) {
          selectedFormats.push(compatibleFormat)
        } else {
          selectedFormats.push(incompatibleFormat)
          convert = true
        }
      }
      this.$emit('update-settings', {id: this.video.id, format: selectedFormats, type: this.type})
      this.$emit('update-format')
      this.$emit('update-settings', {id: this.video.id, convert: convert})
    },
    over (id) {
      document.getElementById(id).style.display = 'block'
    },
    out (id) {
      document.getElementById(id).style.display = 'none'
    }
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
  justify-content: flex-start;
  padding: 2.5%;
  margin-top: 15px;
  flex-grow: 1;
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
  width: 20vw;
  padding: 0;
  border: 1px solid #393939;
  background-color: black;
  margin-left: 20px;
}
#general select{
  width: 20vw;
}
#convert{
  margin-top: 20px;
}
#checkbox_tags{
  display: flex !important; /* Set to none until feature is ready for deployment */
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
  height: auto
}
#tags div input{
  border: none;
  background-color: black;
  width: 100%;
}

.info{
  width: 15px;
  height: 15px;
  margin-left: 10px;
}

#tooltiptexts{
  margin-top: 15px
}
#tooltiptexts p{
  display: none;
}

</style>