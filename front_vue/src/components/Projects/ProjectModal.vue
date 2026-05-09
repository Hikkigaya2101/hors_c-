<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3>{{ project ? 'Редактировать проект' : 'Создать проект' }}</h3>
      
      <input 
        v-model="form.name" 
        placeholder="Название проекта" 
        class="form-input"
        required
      />
      
      <textarea 
        v-model="form.description" 
        placeholder="Описание" 
        rows="3"
        class="form-input"
      ></textarea>
      
      <label class="form-label">Участники команды (можно выбрать нескольких)</label>
      <select 
        v-model="form.members" 
        multiple 
        size="5"
        class="form-input"
      >
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }} ({{ user.email }})
        </option>
      </select>
      <small class="form-hint">Удерживайте Ctrl (Cmd на Mac) для выбора нескольких</small>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="modal-actions">
        <button class="btn btn-outline" @click="close">Отмена</button>
        <button class="btn btn-primary" @click="save" :disabled="loading">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useProjectsStore } from '..//../stores/project'

const props = defineProps({
  project: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['close', 'saved'])

const projectsStore = useProjectsStore()
const users = ref([])
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  description: '',
  members: []
})

onMounted(async () => {
  try {
    await projectsStore.loadUsers()
    users.value = projectsStore.users
    if (props.project) {
      form.name = props.project.name
      form.description = props.project.description || ''
      form.members = props.project.members || []
    }
  } catch (err) {
    error.value = 'Не удалось загрузить список пользователей'
    console.error(err)
  }
})

async function save() {
  if (!form.name.trim()) {
    error.value = 'Название проекта обязательно'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const data = {
      name: form.name.trim(),
      description: form.description,
      members: form.members
    }
    
    if (props.project) {
      await projectsStore.update(props.project.id, data)
    } else {
      await projectsStore.create(data)
    }
    
    emit('saved')
    close()
  } catch (err) {
    console.error('Ошибка сохранения проекта:', err)
    error.value = err.response?.data?.error || 'Ошибка сохранения проекта. Проверьте консоль.'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* стили из предыдущего ответа, плюс добавьте: */
.error-message {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #EF4444;
  color: #EF4444;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}
.modal-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>