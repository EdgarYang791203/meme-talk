<script setup>
import router from "./routes";
import { ref, onMounted, computed, reactive, watchEffect } from 'vue'
import pageBg from './assets/page-bg.jpeg'

const scrollOver = ref(false)

const bookRef = ref<HTMLElement | null>(null)

const bookScrollTop = ref(0)

const hasFliped = ref(false)

const pageBgStyle = computed(() => {
  return {
    backgroundImage: `url(${pageBg})`,
    backgroundSize: '100% auto',
    backgroundPosition: '0% bottom',
    transformOrigin: 'left center',
    transformStyle: 'preserve-3d',
  }
})

watchEffect(() => {
  if (bookScrollTop.value > 2000 && !hasFliped.value) {
    hasFliped.value = true
  }
})

const book = reactive([
  { id: 1, transform: 'none' },
  { id: 2, transform: 'none' },
  { id: 3, transform: 'none' },
  { id: 4, transform: 'none' }
])

const bookScrollListener = ($event) => {
  const scrollTop = $event?.target?.scrollTop
  if (scrollTop) bookScrollTop.value = Math.floor(scrollTop)
  else bookScrollTop.value = 0
}

const flipStyle1 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 500) return { transform: 'rotateY(-180deg)', zIndex: 1 }
  if (scrollTop > 0) return { transform: `rotateY(-${(Math.floor(1.8 * (scrollTop / 5)))}deg)`, zIndex: 4 }
  return { transform: 'none', zIndex: 4 }
})

const flipStyle2 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 1000) return { transform: 'rotateY(-180deg)', zIndex: 2 }
  if (scrollTop > 500) return { transform: `rotateY(-${(Math.floor(1.8 * (scrollTop / 5)))}deg)`, zIndex: 3 }
  return { transform: 'none', zIndex: 3 }
})

const flipStyle3 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 1500) return { transform: 'rotateY(-180deg)', zIndex: 3 }
  if (scrollTop > 1000) return { transform: `rotateY(-${(Math.floor(1.8 * (scrollTop / 5)))}deg)`, zIndex: 2 }
  return { transform: 'none', zIndex: 2 }
})

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
  <div
    class="float-memes fixed w-full h-screen top-0 left-0 z-20 flex justify-center overflow-x-hidden overflow-y-scroll"
    v-if="scrollOver && !hasFliped"
    ref="bookRef"
    @scroll.stop="bookScrollListener"
  >
    <div class="book relative w-full max-w-[800px] h-[400vh]">
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed bottom-0 right-[16%]"
        :style="{
          ...pageBgStyle,
          ...flipStyle1,
        }"
      >
        <span class="text-black h-full flex justify-center items-center">1</span>
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed bottom-0 right-[16%]"
        :style="{
          ...pageBgStyle,
          ...flipStyle2,
        }"
      >
        <span class="text-black h-full flex justify-center items-center">2</span>
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed bottom-0 right-[16%]"
        :style="{
          ...pageBgStyle,
          ...flipStyle3,
        }"
      >
        <span class="text-black h-full flex justify-center items-center">3</span>
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed bottom-0 right-[16%]"
        :style="{
          ...pageBgStyle,
          zIndex: 1,
        }"
      >
        <span class="text-black h-full flex justify-center items-center">4</span>
      </div>
    </div>
  </div>
  <footer class="text-white text-center h-[500px] pt-8">
    Footer
  </footer>
</template>

<style>
#app {
  overflow: hidden;
}
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
.book .page {
  
}
</style>