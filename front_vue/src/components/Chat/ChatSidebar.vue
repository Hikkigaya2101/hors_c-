<template>
  <div class="chat-sidebar" :class="{ open: chatStore.openChats.length > 0 }">
    <div class="chat-sidebar-header">
      <span>Чаты</span>
      <button v-if="chatStore.openChats.length > 0" class="close-sidebar" @click="closeAllChats">✕</button>
    </div>
    <div class="chat-tabs" v-if="chatStore.openChats.length > 0">
      <div
        v-for="chat in chatStore.openChats"
        :key="`${chat.type}_${chat.id}`"
        class="chat-tab"
        :class="{ active: activeKey === `${chat.type}_${chat.id}` }"
        @click="chatStore.setActiveChat(`${chat.type}_${chat.id}`)"
      >
        <span>{{ chat.title }}</span>
        <button class="close-tab" @click.stop="chatStore.closeChat(chat.type, chat.id)">✕</button>
      </div>
    </div>
    <div class="chat-content" v-if="activeChat">
      <ChatWindow :type="activeChat.type" :id="activeChat.id" />
    </div>
    <div v-else class="no-chat">Выберите чат</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useChatStore } from '..//../stores//chat'
import ChatWindow from '..//../components//Chat/ChatWindow.vue'

const chatStore = useChatStore()

const activeKey = computed(() => chatStore.activeChatId)
const activeChat = computed(() => {
  if (!activeKey.value) return null
  const [type, id] = activeKey.value.split('_')
  const chat = chatStore.openChats.find(c => c.type === type && c.id === parseInt(id))
  return chat
})

function closeAllChats() {
  chatStore.openChats = []
  chatStore.activeChatId = null
}
</script>

<style scoped>
.chat-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 0;
  height: 100vh;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1000;
}
.chat-sidebar.open {
  width: 400px;
}
.chat-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}
.chat-tabs {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.chat-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  background: var(--bg-elevated);
  border-radius: 16px;
  cursor: pointer;
  white-space: nowrap;
}
.chat-tab.active {
  background: var(--accent-indigo);
  color: white;
}
.close-tab {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
}
.chat-content {
  flex: 1;
  overflow-y: auto;
}
.no-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}
.close-sidebar {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
}
</style>