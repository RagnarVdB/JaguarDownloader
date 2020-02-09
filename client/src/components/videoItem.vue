<template>
  <div id="item" tabindex="-1" @focus="$emit('current', video)">
    <div id="title">
      <p>{{video.title}}</p>
    </div>
    <div id="progress">
      <div v-bind:style="{width: video.progress + '%'}"></div>
    </div>
    <p id="ext">{{video.settings.ext}}</p>
    <p id="quality">{{video.settings.quality}}</p>
    <button @click="$emit('del-video', video.id)">  
      <img src="../assets/delete.svg"/>
    </button>
  </div>
</template>

<script>
export default {
  name: "videoItem",
  props: ["video"],
}
</script>

<style scoped>
  #item{
    width: 97%;
    height: 60px;
    margin-top: 5px;
    background-color: black;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }
  #item:hover, #item:focus{
    outline: 2px solid rgb(148, 148, 148);
  }
  #item > p{
    margin-left: 15px;
    font-size: 0.9rem;
    width: 80px;
  }
  #title{
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 42px;
    margin-left: 20px;
  }
  #title p{
    font-size: 0.9rem;
  }
  #progress{
    width: 100%;
    height: 25px;
    background-color: var(--main);
    border-radius: 13px;
    margin-left: 15px;
  }
  #progress > div{
    background-color: #3869DC;
    height: 100%;
    border-radius: 13px;
  }
  #quality, #ext{
    margin-right: 15px;
    width: 60px;
  }
  #item button{
    margin-right: 15px;
    background: none;
    border: none;
  }

  #item button img{
    width: 18px;
  }
</style>