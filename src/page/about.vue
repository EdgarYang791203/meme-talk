<template>
  <div>about page</div>
  <button @click="toHome">toHome</button>
</template>

<script setup>
import router from "../routes";

const toHome = () => {
  router.push("/").catch(() => {});
};
</script>
