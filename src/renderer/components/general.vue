<template>
  <div id="general">
    <div id="left">
      <p>{{ status }}</p>
    </div>
    <div id="right">
      <p>location:</p>
      <button
        class="link"
        @click="SetFolder"
      >
        <p>{{ folder }}</p>
      </button>
      <button
        id="start"
        :class="{ greyed: status !=='ready to download' && status !=='' }"
        @click="$emit('start')"
      >
        start
      </button>
    </div>
  </div>
</template>

<script>
const { dialog } = require('electron').remote
export default {
  name: 'General',
  props: ['folder', 'status'],
  methods: {
    SetFolder () {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }, (dir) => {
        if (dir) {
          this.$emit('set-folder', dir[0])
        }
      })
    }
  }
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
  .greyed{
    color: var(--text-grey);
    border: 1px solid var(--text-grey);
    cursor: default;
  }
  .greyed:hover{
    background-color: transparent;
    color: var(--text-grey)
  }
  p{
    margin-right: 10px;
    color: var(--text-grey);
    font-size: 0.8rem;
  }
  .link{
    border: none;
  }
  .link p{
    color: #0077FF;
    text-decoration: underline;
  }
  .link:hover{
    background-color: transparent;
  }
</style>