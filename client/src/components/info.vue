<template>
  <div id="info">
    <img :src="video.thumbnail">
    <div id="wrapper">
      <div class="labels">
        <p>Title:</p>
        <p v-if="video.channel">
          Channel:
        </p>
        <p v-if="video.date">
          Date:
        </p>
        <p v-if="video.desc">
          Description:
        </p>
      </div>
      <div class="content">
        <p>{{ video.title }}</p>
        <p v-if="video.channel">
          {{ video.channel }}
        </p>
        <p v-if="video.date">
          {{ video.date }}
        </p>
        <p v-if="video.desc">
          {{ video.desc }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Info",
  props: ["video"]
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
}

#info > img{
  width: 100%;
  align-self: center;
}

#wrapper{
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}

#wrapper > div{
  margin-left: 15px;
}

#wrapper > div > p{
  margin-top: 10px;
}

.labels{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.content{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>