<template>
  <div class="project-detail">
    <div class="top-bar">
      <button class="btn btn-outline" @click="$router.back()">← Назад</button>
      <h2>{{ project.name }}</h2>
      <button class="btn btn-primary" @click="openTaskModal">+ Добавить задачу</button>
    </div>

    <div class="project-description">
      {{ project.description || 'Нет описания' }}
    </div>

    <div class="tasks-section">
      <h3>Задачи проекта</h3>
      <div v-if="tasks.length === 0" class="empty-tasks">Нет задач</div>
      <div v-else class="tasks-list">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <div class="task-info">
            <div class="task-title">
              <strong>{{ task.title }}</strong>
              <span :class="'priority priority-' + task.priority.toLowerCase()">
                {{ priorityText(task.priority) }}
              </span>
            </div>
            <div class="task-meta">
              Исполнитель: {{ task.assignee_name || 'Не назначен' }}
              | Дедлайн: {{ task.deadline || '—' }}
            </div>
            <div class="task-description" v-if="task.description">
              {{ task.description }}
            </div>
          </div>
          <div class="task-actions">
            <select :value="task.status" @change="updateTaskStatus(task.id, $event.target.value)" class="status-select">
              <option value="todo">К выполнению</option>
              <option value="progress">В работе</option>
              <option value="review">На проверке</option>
              <option value="done">Готово</option>
            </select>
            <button class="btn btn-outline btn-sm" @click="openEditTaskModal(task)">✏️</button>
            <button class="btn btn-outline btn-sm" @click="deleteTask(task.id)">🗑️</button>
            <button class="btn btn-outline btn-sm" @click="chatStore.openTaskChat(task.id, task.title)">
              💬 Чат задачи
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="project-chat-section">
      <h3>Общий чат проекта</h3>
      <ChatWindow type="project" :id="projectId" />
    </div>

    <TaskModal
      v-if="taskModalVisible"
      :project-id="projectId"
      :task="editingTask"
      @close="taskModalVisible = false"
      @saved="onTaskSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '..//../stores/project'
import { useChatStore } from '..//../stores/chat'
import ChatWindow from '..//../components/Chat/ChatWindow.vue'
import TaskModal from './TaskModal.vue'

const route = useRoute()
const projectId = ref(parseInt(route.params.id))
const projectsStore = useProjectsStore()
const chatStore = useChatStore()

const project = ref({})
const tasks = ref([])
const taskModalVisible = ref(false)
const editingTask = ref(null)

async function loadProject() {
  await projectsStore.loadProjects()
  project.value = projectsStore.projects.find(p => p.id === projectId.value) || {}
  tasks.value = await projectsStore.loadTasks(projectId.value)
}

async function updateTaskStatus(taskId, newStatus) {
  await projectsStore.updateTask(projectId.value, taskId, { status: newStatus })
  await loadProject()
}

async function deleteTask(taskId) {
  if (confirm('Удалить задачу?')) {
    await projectsStore.deleteTask(projectId.value, taskId)
    await loadProject()
  }
}

function openTaskModal() {
  editingTask.value = null
  taskModalVisible.value = true
}

function openEditTaskModal(task) {
  editingTask.value = task
  taskModalVisible.value = true
}

async function onTaskSaved() {
  taskModalVisible.value = false
  await loadProject()
}

function priorityText(priority) {
  if (priority === 'High') return '🔴 Высокий'
  if (priority === 'Medium') return '🟡 Средний'
  return '🟢 Низкий'
}

onMounted(() => {
  loadProject()
})
</script>

<style scoped>
.project-detail {
  animation: fadeIn 0.2s ease;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.project-description {
  background: var(--bg-elevated);
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}
.tasks-section {
  margin-bottom: 2rem;
}
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.task-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.task-info {
  flex: 1;
}
.task-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.3rem;
}
.priority {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
}
.priority-high {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}
.priority-medium {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}
.priority-low {
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
}
.task-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.task-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.status-select {
  padding: 0.3rem 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
}
.project-chat-section {
  margin-top: 2rem;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
}
.empty-tasks {
  text-align: center;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  color: var(--text-muted);
}
</style>