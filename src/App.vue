<script setup>
import router from "./routes";
import { ref, onMounted } from 'vue'

const scrollOver = ref(false)

const setScrollOver = (val) => {
  scrollOver.value = val 
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    const overHeigth = window.scrollY > 200
    setScrollOver(overHeigth)
  });
})

const toAbout = () => {
  router.push("/about").catch(() => {});
};
</script>

<template>
  <header :class="`text-center shadow flex px-3 ${scrollOver ? 'justify-start sticky top-0 left-0 z-10 bg-[#870000] animate-[slide-down_0.5s_ease-in-out]' : 'justify-center bg-transparent'}`">
    <h1 class="font-bold text-white text-4xl py-1">MEME Talk</h1>
  </header>
  <div class="nav-btns text-center">
    <button @click="toAbout">toAbout</button>
  </div>
  <div class="layout w-full max-w-[1200px] min-h-screen mx-auto text-center">
    <router-view />
  </div>
  <div class="float-memes fixed">

  </div>
  <footer class="text-white text-center h-[500px] pt-8">
    Footer
  </footer>
</template>

<style>
.layout {
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: 200vh;
}
.layout::before {
  opacity: 0.2;
  background: transparent url('./assets/meme-bg.webp') fixed;
  background-position: 26% top;
  background-size: auto 100%;
  background-repeat: no-repeat;
  content: "";
  position: absolute;
  width: 50%;
  height: 100%;
  top: 50px;
  left: 0;
  z-index: -1;
}
.layout::after {
  opacity: 0.2;
  background: transparent url('./assets/meme2.jpeg') fixed;
  background-position: 74% top;
  background-size: auto 100%;
  background-repeat: no-repeat;
  content: "";
  position: absolute;
  width: 50%;
  height: 100%;
  top: 50px;
  right: 0;
  z-index: -1;
}
</style>