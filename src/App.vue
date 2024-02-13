<script setup>
import router from "./routes";
import { ref, onMounted, computed, reactive, watchEffect } from "vue";
import pageBg from "./assets/page-bg.jpeg";

import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref as Ref,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

/** 初始化 Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyCO5QzTyGMOhbq1etOPxEeqgLf_5NsJOyk",
  authDomain: "meme-talk-4adb4.firebaseapp.com",
  projectId: "meme-talk-4adb4",
  storageBucket: "meme-talk-4adb4.appspot.com",
  messagingSenderId: "501625661038",
  appId: "1:501625661038:web:bba35607396a8bfe29287f",
  measurementId: "G-ZWVBHHKYRC",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage();
const listRef = Ref(storage, "images/");

let currentUser = reactive(null);

let firebaseAuth = reactive(null);

const isLogin = ref(false);

const scrollOver = ref(false);

const bookRef = (ref < HTMLElement) | (null > null);

const bookScrollTop = ref(0);

const hasFliped = ref(false);

let imageList = reactive([]);

const getImages = async () => {
  try {
    const res = await listAll(listRef); // 取得清單
    const urls = await Promise.all(
      res.items.map(async (itemRef) => ({
        url: await getDownloadURL(itemRef), // 將連結放入陣列
        fullPath: itemRef.fullPath,
      }))
    );
    imageList = urls;
  } catch (error) {
    console.error("Error getting download URLs", error);
  } finally {
  }
};

const handleLogin = (user) => {
  if (user) {
    currentUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    isLogin.value = true;
  } else {
    currentUser = null;
    isLogin.value = false;
  }
};

const handleSingnIn = () => {
  const provider = new GoogleAuthProvider();
  if (firebaseAuth && provider) {
    signInWithPopup(firebaseAuth, provider)
      .then((result) => {
        const { user } = result;
        if (user) handleLogin(user);
      })
      .catch((error) => console.log(error));
  }
};

const handleSingnOut = () => {
  if (firebaseAuth) {
    signOut(firebaseAuth)
      .then((res) => {
        handleLogin(null);
      })
      .catch((error) => console.log(error));
  }
};

const pageBgStyle = computed(() => {
  return {
    backgroundImage: `url(${pageBg})`,
    backgroundSize: "auto 100%",
    backgroundPosition: "0% top",
    transformOrigin: "left center",
    transformStyle: "preserve-3d",
  };
});

watchEffect(() => {
  if (bookScrollTop.value > 2000 && !hasFliped.value) {
    hasFliped.value = true;
  }
});

const book = reactive([
  { id: 1, transform: "none" },
  { id: 2, transform: "none" },
  { id: 3, transform: "none" },
  { id: 4, transform: "none" },
]);

const bookScrollListener = ($event) => {
  const scrollTop = $event?.target?.scrollTop;
  if (scrollTop) bookScrollTop.value = Math.floor(scrollTop);
  else bookScrollTop.value = 0;
};

const flipStyle1 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 500) return { transform: "rotateY(-180deg)", zIndex: 1 };
  if (scrollTop > 0)
    return {
      transform: `rotateY(-${Math.floor(1.8 * (scrollTop / 5))}deg)`,
      zIndex: 4,
    };
  return { transform: "none", zIndex: 4 };
});

const flipStyle2 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 1000) return { transform: "rotateY(-180deg)", zIndex: 2 };
  if (scrollTop > 500)
    return {
      transform: `rotateY(-${Math.floor(1.8 * ((scrollTop - 500) / 5))}deg)`,
      zIndex: 3,
    };
  return { transform: "none", zIndex: 3 };
});

const flipStyle3 = computed(() => {
  const scrollTop = bookScrollTop.value;
  if (scrollTop >= 1500) return { transform: "rotateY(-180deg)", zIndex: 3 };
  if (scrollTop > 1000)
    return {
      transform: `rotateY(-${Math.floor(1.8 * ((scrollTop - 1000) / 5))}deg)`,
      zIndex: 2,
    };
  return { transform: "none", zIndex: 2 };
});

const setScrollOver = (val) => {
  scrollOver.value = val;
};

onMounted(() => {
  window.addEventListener("scroll", () => {
    const overHeigth = window.scrollY > 200;
    setScrollOver(overHeigth);
  });
  firebaseAuth = getAuth();
  if (firebaseApp && firebaseApp) {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        handleLogin(user);
      } else {
        // throw new Error('get user error')
      }
    });
  }
  getImages();
});

const toAbout = () => {
  router.push("/about").catch(() => {});
};
</script>

<template>
  <header
    :class="`text-center shadow flex px-3 justify-between ${
      scrollOver
        ? 'sticky top-0 left-0 z-10 bg-[#870000] animate-[slide-down_0.5s_ease-in-out] pr-5'
        : ' bg-transparent'
    }`"
  >
    <span :class="isLogin ? 'w-[148px]' : 'w-[36px]'" v-if="!scrollOver"></span>
    <h1 class="font-bold text-white text-4xl py-1">MEME Talk</h1>
    <button
      v-if="!isLogin"
      class="p-0 bg-transparent border-none outline-none"
      @click="handleSingnIn"
    >
      <img class="w-[36px]" src="./assets/google-icon.svg" alt="google-icon" />
    </button>
    <div class="flex items-center" v-else>
      <span
        class="w-[36px] h-[36px] rounded mr-2 bg-cover"
        v-if="currentUser?.photoURL"
        :style="{ backgroundImage: `url(${currentUser.photoURL})` }"
      ></span>
      <span class="text-white pr-2 text-xl" v-if="currentUser">{{
        currentUser.displayName
      }}</span>
      <button
        class="p-0 bg-transparent border-none outline-none"
        @click="handleSingnOut"
      >
        <img
          class="w-[36px] brightness-200"
          src="./assets/sign-out-icon.svg"
          alt="google-icon"
        />
      </button>
    </div>
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
        class="page w-[400px] text-right h-full bg-no-repeat fixed top-[50px] flex items-center"
        :style="{
          ...pageBgStyle,
          ...flipStyle1,
        }"
      >
        <img
          v-if="imageList.length"
          :src="imageList[0].url"
          class="w-full"
          alt="meme"
        />
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed top-[50px] flex items-center"
        :style="{
          ...pageBgStyle,
          ...flipStyle2,
        }"
      >
        <img
          v-if="imageList.length"
          :src="imageList[1].url"
          class="w-full"
          alt="meme"
        />
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed top-[50px] flex items-center"
        :style="{
          ...pageBgStyle,
          ...flipStyle3,
        }"
      >
        <img
          v-if="imageList.length"
          :src="imageList[2].url"
          class="w-full max-h-full"
          alt="meme"
        />
      </div>
      <div
        class="page w-[400px] text-right h-full bg-no-repeat fixed top-[50px] flex items-center"
        :style="{
          ...pageBgStyle,
          zIndex: 1,
        }"
      >
        <img
          v-if="imageList.length"
          :src="imageList[3].url"
          class="w-full"
          alt="meme"
        />
      </div>
    </div>
  </div>
  <footer class="text-white text-center h-[500px] pt-8">Footer</footer>
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
  background: transparent url("./assets/meme-bg.webp") fixed;
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
  background: transparent url("./assets/meme2.jpeg") fixed;
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
  right: calc((100vw - 800px) / 2);
  padding-left: 24px;
}
</style>
