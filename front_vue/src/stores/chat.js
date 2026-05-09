import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const openChats = ref([]) // массив { type, id, title }
  const activeChatId = ref(null) // строка: 'project_1' или 'task_5'

  function openChat(type, id, title) {
    const key = `${type}_${id}`
    if (!openChats.value.find(c => `${c.type}_${c.id}` === key)) {
      openChats.value.push({ type, id, title })
    }
    activeChatId.value = key
  }

  function closeChat(type, id) {
    const key = `${type}_${id}`
    openChats.value = openChats.value.filter(c => `${c.type}_${c.id}` !== key)
    if (activeChatId.value === key) {
      activeChatId.value = openChats.value[0] ? `${openChats.value[0].type}_${openChats.value[0].id}` : null
    }
  }

  function setActiveChat(key) {
    activeChatId.value = key
  }

  function isChatOpen(type, id) {
    return openChats.value.some(c => c.type === type && c.id === id)
  }

  return { openChats, activeChatId, openChat, closeChat, setActiveChat, isChatOpen }
})