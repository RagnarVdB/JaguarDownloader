<template>
    <div id="list">
        <addVideo v-on:add-video="$emit('add-video', newVideo)"/>
        <div id="items" v-for="video in videos" :key=video.id>
            <videoItem v-bind:video="video" v-on:current="$emit('change', video)" v-on:del-video="$emit('del-video', video.id)" />
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