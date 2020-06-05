<template>

<div>
  <div id="tags">
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
  </div>
</div>
</template>

<script>
import { getToken, getMetadata } from '../functions/metadatagetter'
export default {
  name: 'Metadata',
  props: ['video'],
  computed: {
    tags: {
      get () {
        return this.video.settings.tags
      },
      set (val) {
        this.$emit('update-settings', {id: this.video.id, tags: val})
      }
    }
  },
  created () {
    getToken()
      .then(token => getMetadata(token, 'Burn The Witch', 'Radiohead'))
      .then(res => console.log(res))
      .catch(err => console.error(err))
  }
}
</script>

<style scoped>
p {
  color: var(--text-grey);
  font-size: 0.7rem;
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
</style>