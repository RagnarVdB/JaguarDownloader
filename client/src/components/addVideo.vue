<template>
    <div id="addVideo">
        <label for="add video">ADD URL</label>
        <input type="text" id="url_input">
        <button>ENTER</button>
    </div>
</template>

<script>
export default {
    name: "addVideo",
}
</script>

<style scoped>
    #addVideo{
        width: 97%;
        height: 50px;
        margin-top: 15px;
        background-color: black;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 40px;
    }
    label{
        color: white;
        margin-left: 20px;
        margin-right: 15px;
        width: 6rem;
        font-size: 0.8rem;
    }
    #url_input{
        width: 100%;
        background-color: var(--main);
        border: 1px solid #707070;
        color: white;
    }
    button{
        border: 1px solid white;
        background-color: transparent;
        color: white;
        border-radius: 10px;
        padding: 5px;
        margin-left: 20px;
        margin-right: 20px;
        width: 90px;
        font-size: 0.8rem;
    }
    
</style>