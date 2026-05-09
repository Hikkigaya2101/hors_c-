<!-- src/components/Chat/ChatWindow.vue -->
<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <strong>{{ msg.author_name }}</strong>
        <small>{{ formatDate(msg.created_at) }}</small>
        <p>{{ msg.text }}</p>
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="newMessage"
        @keyup.enter="send"
        placeholder="Введите сообщение..."
      />
      <button class="btn btn-primary btn-sm" @click="send">Отправить</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { fetchProjectMessages, sendProjectMessage, fetchTaskMessages, sendTaskMessage } from '..//../api'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (val) => ['project', 'task'].includes(val)
  },
  id: {
    type: Number,
    required: true
  }
})

const messages = ref([])
const newMessage = ref('')
let interval = null
const messagesContainer = ref(null)

const loadMessages = async () => {
  try {
    if (props.type === 'project') {
      messages.value = await fetchProjectMessages(props.id)
    } else {
      messages.value = await fetchTaskMessages(props.id)
    }
    scrollToBottom()
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', error)
  }
}

const send = async () => {
  if (!newMessage.value.trim()) return
  try {
    if (props.type === 'project') {
      await sendProjectMessage(props.id, newMessage.value)
    } else {
      await sendTaskMessage(props.id, newMessage.value)
    }
    newMessage.value = ''
    await loadMessages()
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString()
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
  height: 100%;
  background: var(--bg-secondary);
  border-radius: 12px;
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
</style>