import { defineStore } from "pinia";

export const useMemeStore = defineStore("meme", {
  state: () => {
    return {
      memes: [],
    };
  },
  getters: {
    memeList: (state) => state.memes,
  },
  actions: {
    setList(list) {
      if (list && list.length) this.memes = list;
    },
  },
});
