<template>
  <div class="chat">
    <div class="messages" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <strong>{{ msg.author_name }}</strong> <small>{{ msg.created_at }}</small>
        <p>{{ msg.text }}</p>
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="send" placeholder="Сообщение..." />
      <button @click="send">Отправить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import api from '@/api'

const props = defineProps({
  chatType: { type: String, required: true }, // 'project' or 'task'
  id: { type: Number, required: true }
})

const messages = ref([])
const newMessage = ref('')
let interval = null

async function loadMessages() {
  const url = props.chatType === 'project'
    ? `/tasks/projects/${props.id}/messages/`
    : `/tasks/tasks/${props.id}/messages/`
  const res = await api.get(url)
  messages.value = res.data
  scrollToBottom()
}

async function send() {
  if (!newMessage.value.trim()) return
  const url = props.chatType === 'project'
    ? `/tasks/projects/${props.id}/messages/`
    : `/tasks/tasks/${props.id}/messages/`
  await api.post(url, { text: newMessage.value })
  newMessage.value = ''
  await loadMessages()
}

function scrollToBottom() {
  nextTick(() => {
    const container = document.querySelector('.messages')
    if (container) container.scrollTop = container.scrollHeight
  })
}

onMounted(() => {
  loadMessages()
  interval = setInterval(loadMessages, 3000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

watch(() => props.id, () => loadMessages())
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  background: var(--bg-elevated);
  padding: 0.75rem;
  border-radius: 14px;
  max-width: 85%;
  align-self: flex-start;
}

.message strong {
  color: var(--accent-indigo);
  font-size: 0.85rem;
}

.message small {
  color: var(--text-muted);
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.message p {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  word-break: break-word;
}

.input-area {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.input-area input {
  flex: 1;
  margin: 0;
}

.input-area button {
  padding: 0.6rem 1.2rem;
}

@media (max-width: 640px) {
  .chat-container {
    height: 350px;
  }
  .message {
    max-width: 95%;
  }
}
</style>