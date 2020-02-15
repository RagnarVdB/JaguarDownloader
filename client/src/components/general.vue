<template>
  <div id="general">
    <div id=left>
      <p>{{status}}</p>
    </div>
    <div id="right">
      <p>location:</p>
      <p class="link">{{folder}}</p>
      <button id="start" @click="$emit('start')">start</button>
    </div>
    
  </div>
</template>

<script>
export default {
  name: "general",
  components: {

  },
  props: ["folder", "status"]
}
</script>
<style scoped>
  #general{
    background-color: var(--main);
    grid-column: 1 / 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  #left{
    margin-left: 20px;
  }
  #left p{
    font-size: 0.8em;
  }
  #right{
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
  button{
    border: 1px solid white;
    background-color: transparent;
    color: white;
    border-radius: 12px;
    padding: 5px;
    margin-left: 20px;
    margin-right: 20px;
    width: 90px;
    font-size: 0.8rem;
  }
  p{
    margin-right: 10px;
    color: var(--text-grey);
    font-size: 0.8rem;
  }
  .link{
    color: #0077FF;
    text-decoration: underline;
  }
</style>