<template>
    <div id="list">
        <addVideo/>
        <div id="items" v-for="video in videos" :key=video.id>
            <videoItem v-bind:video="video"/>
        </div>
    </div>
</template>

<script>
import addVideo from "./addVideo"
import videoItem from "./videoItem"
export default {
    name: "list",
    props: ["videos"],
    components: {
        addVideo,
        videoItem
    }
}
</script>
<style scoped>
    #list, #items{
        background-color: var(--main);
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #items{
        width: 100%;
    }
</style>