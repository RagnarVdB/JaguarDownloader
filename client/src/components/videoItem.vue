<template>
    <div id="item">
        <p id="title">{{video.title}}</p>
        <div id="progress">
            <div v-bind:style="{width: video.progress + '%'}"></div>
        </div>
        <p id="ext">{{video.settings.ext}}</p>
        <p id="quality">{{video.settings.quality}}</p>
    </div>
</template>

<script>
export default {
    name: "videoItem",
    props: ["video"]
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
        margin-bottom: 20px;
    }
    #title{
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 45px; 
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
    #item > p{
        margin-left: 15px;
    }
    #quality, #ext{
        margin-right: 15px;
        width: 60px;
    }
</style>