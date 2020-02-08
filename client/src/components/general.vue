<template>
    <div id="general">
        <p>location:</p>
        <p class="link">{{folder}}</p>
        <button id="start">start</button>
    </div>
</template>

<script>
export default {
    name: "general",
    components: {

    },
    props: ["folder"]
}
</script>
<style scoped>
    #general{
        background-color: var(--main);
        grid-column: 1 / 3;
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