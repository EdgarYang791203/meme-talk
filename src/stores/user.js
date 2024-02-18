import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useUserStore = defineStore("user", () => {
  const isLogin = ref(false);
  const userInfo = reactive({});
  const allMembers = reactive([]);
  function addMember(member) {
    const confirm = allMembers.map((member) => member.uid);
    if (member && !confirm.includes(member.uid)) allMembers.push(member);
  }

  return { isLogin, userInfo, allMembers, addMember };
});
