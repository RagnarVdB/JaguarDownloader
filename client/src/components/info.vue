<template>
    <div id="info">
        <img src="../assets/thumbnail.jpg"/>
        <div id="wrapper">
            <div class="labels">
                <p>Title:</p>
                <p>Channel:</p>
                <p>Date:</p>
            </div>
            <div class="content">
                <p>{{video.title}}</p>
                <p>{{video.channel}}</p>
                <p>{{video.date}}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "info",
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