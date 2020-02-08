<template>
    <div id="addVideo">
        <form @submit="addVideo">
        <label for="add video">ADD URL</label>
        <input type="text" id="url_input" placeholder="enter url" v-model="url">
        <input class = "button" type="submit" @click="$emit('add-video', 'test')" value="enter"/>
        </form>
    </div>
</template>

<script>
export default {
    name: "addVideo",
    methods: {
        addVideo(event){
            event.preventDefault()
            const newVideo = {}
            this.$emit('add-video', newVideo)
            this.url = ""
        }
    }
}
</script>

<style scoped>
    #addVideo{
        width: 97%;
        height: 50px;
        margin-top: 15px;
        background-color: black;
        margin-bottom: 40px;

    }
    form{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
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
    .button{
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
    .button:hover{
        background-color: white;
        color: black;
    }
    
</style>