<template>
  <div id="info">
    <img :src="video.thumbnail">
    <div id="wrapper">
      <p class="label">Title:</p>
      <p class="content">{{ video.title }}</p>

      <p v-if="video.channel" class="label">
        Channel:
      </p>
      <p v-if="video.channel" class="content">
        {{ video.channel }}
      </p>

      <p v-if="video.date" class="label">
        Date:
      </p>
      <p v-if="video.date" class="content">
        {{ video.date }}
      </p>

      <p v-if="video.desc" class="label">
        Description:
      </p>
      <p v-if="video.desc" class="content">
        {{ video.desc }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Info',
  props: ['video']
}
</script>

<style scoped>
p{
  color: var(--text-grey);
  font-size: 0.7rem;
}

#info{
  border: 1px solid #535353;
  width: 97%;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 2.5%;
  height: fit-content;
  flex-grow: 0;
}

#info > img{
  width: 100%;
  align-self: center;
  max-height: 220px;
}

#wrapper{
  display: grid;
  grid-template-columns: 1fr 4fr;
  margin-bottom: 10px;
  margin-top: 15px;
  grid-gap: 10px 20px;
}

#wrapper > div{
  margin-left: 15px;
}

#wrapper > div > p{
  margin-top: 10px;
}

.label{
  text-align: right;
}

</style>