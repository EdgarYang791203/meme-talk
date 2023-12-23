<template>
  <div>home page</div>
  <button @click="toAbout">toAbout</button>
</template>

<script setup>
import router from "../routes";

const toAbout = () => {
  router.push("/about").catch(() => {});
};
</script>
