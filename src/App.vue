<script setup>
import router from "./routes";
import { ref, onMounted, computed, reactive, watchEffect } from "vue";
import { useUserStore } from "./stores/user";
import { useMemeStore } from "./stores/meme";
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
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// TODO: 會員相關資料
const userStore = useUserStore();
const isLogin = computed(() => userStore.isLogin);
const userInfo = computed(() => userStore.userInfo);
const allMembers = computed(() => userStore.allMembers);
const { addMember } = userStore;
// TODO: 迷因相關資料
const memeStore = useMemeStore();
const memeList = computed(() => memeStore.memeList);
const { setList } = memeStore;

// TODO: 初始化 Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage();
const listRef = Ref(storage, "images/");

let firebaseAuth = reactive(null);

const scrollOver = ref(false);

const bookScrollTop = ref(0);

const hasFliped = ref(false);

let articles = reactive([]);

// TODO: 取得所有梗圖
const getImages = async () => {
  try {
    const res = await listAll(listRef); // 取得清單
    const urls = await Promise.all(
      res.items.map(async (itemRef) => ({
        url: await getDownloadURL(itemRef), // 將連結放入陣列
        fullPath: itemRef.fullPath,
      }))
    );
    setList(urls);
  } catch (error) {
    console.error("Error getting download URLs", error);
  } finally {
  }
};

// TODO: 判斷登入、解析登入資料
const handleLogin = async (user) => {
  if (user) {
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    if (user.uid) {
      const docRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        // console.log(docSnapshot.data());
      } else {
        await setDoc(docRef, userData);
      }
      userStore.$patch({
        isLogin: true,
        userInfo: userData,
      });
    }
  } else {
    userStore.$patch({
      isLogin: false,
      userInfo: {},
    });
  }
};

// TODO: google 登入
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

// TODO: firebase 登出
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
  if (firebaseApp && firebaseAuth) {
    onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && user.uid) {
        handleLogin(user);
      } else {
        // throw new Error('get user error')
      }
    });
  }
  getImages();
  const userCollection = collection(db, "users");
  onSnapshot(userCollection, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        // 新增的貼文
        const postData = change.doc.data();
        addMember(postData);
      }
    });
  });
  const articleCollection = collection(db, "upload");
  onSnapshot(articleCollection, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        // 新增的貼文
        const postData = change.doc.data();
        articles.push(postData);
      }
      // if (change.type === "modified") {
      //   console.log("修改貼文：", change.doc.data());
      // }
      // if (change.type === "removed") {
      //   console.log("刪除貼文：", change.doc.data());
      // }
    });
  });
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
    <h1 class="font-bold text-white text-4xl py-1">MEME Talk</h1>
    <button
      v-if="!isLogin"
      class="p-0 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none"
      @click="handleSingnIn"
    >
      <img class="w-[36px]" src="./assets/google-icon.svg" alt="google-icon" />
    </button>
    <div class="flex items-center" v-else>
      <img
        v-if="userInfo.photoURL"
        class="w-[36px] h-[36px] rounded mr-2 inline-block"
        :src="userInfo.photoURL"
        alt="headshot"
      />
      <span class="text-white pr-2 text-xl" v-if="userInfo">{{
        userInfo.displayName
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
          v-if="memeList.length"
          :src="memeList[0].url"
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
          v-if="memeList.length"
          :src="memeList[1].url"
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
          v-if="memeList.length"
          :src="memeList[2].url"
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
          v-if="memeList.length"
          :src="memeList[3].url"
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
