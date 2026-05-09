<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3>{{ task ? 'Редактировать задачу' : 'Новая задача' }}</h3>
      
      <input 
        v-model="form.title" 
        placeholder="Название задачи" 
        class="form-input"
      />
      
      <textarea 
        v-model="form.description" 
        placeholder="Описание" 
        rows="3"
        class="form-input"
      ></textarea>
      
      <label class="form-label">Исполнитель</label>
      <select v-model="form.assignee" class="form-input">
        <option :value="null">Не назначен</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }} ({{ user.email }})
        </option>
      </select>
      
      <label class="form-label">Приоритет</label>
      <select v-model="form.priority" class="form-input">
        <option value="High">Высокий</option>
        <option value="Medium">Средний</option>
        <option value="Low">Низкий</option>
      </select>
      
      <label class="form-label">Дедлайн</label>
      <input type="date" v-model="form.deadline" class="form-input" />
      
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
import { ref, reactive, onMounted } from 'vue'
import { useProjectsStore } from '../..//stores/project'

const props = defineProps({
  projectId: {
    type: Number,
    required: true
  },
  task: {
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
  title: '',
  description: '',
  assignee: null,
  priority: 'Medium',
  deadline: ''
})

onMounted(async () => {
  try {
    await projectsStore.loadUsers()
    users.value = projectsStore.users
    if (props.task) {
      form.title = props.task.title
      form.description = props.task.description || ''
      form.assignee = props.task.assignee
      form.priority = props.task.priority
      form.deadline = props.task.deadline || ''
    }
  } catch (err) {
    error.value = 'Не удалось загрузить список пользователей'
    console.error(err)
  }
})

async function save() {
  if (!form.title.trim()) {
    error.value = 'Название задачи обязательно'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = {
      title: form.title.trim(),
      description: form.description,
      assignee: form.assignee,
      priority: form.priority,
      deadline: form.deadline,
      status: 'todo'
    }
    if (props.task) {
      await projectsStore.updateTask(props.projectId, props.task.id, data)
    } else {
      await projectsStore.createTask(props.projectId, data)
    }
    emit('saved')
    close()
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.error || 'Ошибка сохранения задачи'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #111827;
  border-radius: 28px;
  padding: 1.8rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid #1F2937;
}
.form-input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  background: #1E293B;
  border: 1px solid #334155;
  border-radius: 12px;
  color: white;
}
.form-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #94A3B8;
}
.error-message {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid #EF4444;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #EF4444;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>