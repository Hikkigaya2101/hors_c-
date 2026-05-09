<template>
  <div class="personal-tasks">
    <div class="top-bar">
      <h2>Мои задачи</h2>
      <select v-model="statusFilter" class="filter-select">
        <option value="all">Все</option>
        <option value="todo">К выполнению</option>
        <option value="progress">В работе</option>
        <option value="review">На проверке</option>
        <option value="done">Готово</option>
      </select>
    </div>

    <div v-if="tasksStore.loading" class="loading">Загрузка задач...</div>
    <div v-else-if="tasksStore.tasks.length === 0" class="empty-state">
      У вас пока нет задач
    </div>
    <div v-else class="task-table">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Проект</th>
            <th>Приоритет</th>
            <th>Статус</th>
            <th>Дедлайн</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id">
            <td class="task-title-cell">
              <strong>{{ task.title }}</strong>
              <br /><small>{{ task.description || 'Нет описания' }}</small>
            </td>
            <td>{{ task.project_name || '—' }}</td>
            <td>
              <span :class="priorityClass(task.priority)">
                {{ priorityText(task.priority) }}
              </span>
            </td>
            <td>
              <select
                :value="task.status"
                @change="updateStatus(task.id, $event.target.value)"
                class="status-select"
              >
                <option value="todo">К выполнению</option>
                <option value="progress">В работе</option>
                <option value="review">На проверке</option>
                <option value="done">Готово</option>
              </select>
            </td>
            <td :class="{ overdue: isOverdue(task.deadline, task.status) }">
              {{ task.deadline || '—' }}
              <span v-if="isOverdue(task.deadline, task.status)" class="overdue-badge">просрочено</span>
            </td>
            <td class="actions">
             <button class="btn btn-outline btn-sm" @click="chatStore.openTaskChat(task.id, task.title)">
    💬 Чат
  </button>

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '..//../stores/tasks'
import { useChatStore } from '..//..//stores/chat'

const tasksStore = useTasksStore()
const chatStore = useChatStore()
const statusFilter = ref('all')

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return tasksStore.tasks
  return tasksStore.tasks.filter(t => t.status === statusFilter.value)
})

function priorityClass(priority) {
  return {
    priority_high: priority === 'High',
    priority_medium: priority === 'Medium',
    priority_low: priority === 'Low'
  }
}

function priorityText(priority) {
  if (priority === 'High') return '🔴 Высокий'
  if (priority === 'Medium') return '🟡 Средний'
  return '🟢 Низкий'
}

function isOverdue(deadline, status) {
  if (status === 'done') return false
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

async function updateStatus(taskId, newStatus) {
  await tasksStore.updateStatus(taskId, newStatus)
}

function openTaskChat(task) {
  chatStore.openTaskChat(task.id, task.title)
}
onMounted(async () => {
  await tasksStore.loadTasks()
})
</script>

<style scoped>
.personal-tasks {
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

.filter-select {
  width: auto;
  min-width: 180px;
  padding: 0.5rem 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
}

.task-table {
  background: var(--bg-secondary);
  border-radius: 20px;
  border: 1px solid var(--border);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  color: var(--text-secondary);
  font-weight: 500;
}

tr:hover {
  background: rgba(30, 41, 59, 0.5);
}

.task-title-cell {
  max-width: 300px;
}

.task-title-cell small {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.priority_high {
  color: var(--danger);
  font-weight: 600;
}

.priority_medium {
  color: var(--warning);
}

.priority_low {
  color: var(--accent-green);
}

.status-select {
  padding: 0.3rem 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.overdue {
  color: var(--danger);
  font-weight: 500;
}

.overdue-badge {
  margin-left: 0.5rem;
  font-size: 0.7rem;
  background: rgba(239, 68, 68, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 20px;
}

.actions {
  white-space: nowrap;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 20px;
}

@media (max-width: 768px) {
  th, td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
  .task-title-cell {
    max-width: 200px;
  }
}
</style>