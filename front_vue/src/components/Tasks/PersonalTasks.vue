<template>
  <div>
    <div class="top-bar">
      <h2>Мои задачи</h2>
      <select v-model="statusFilter">
        <option value="all">Все</option>
        <option value="todo">К выполнению</option>
        <option value="progress">В работе</option>
        <option value="review">На проверке</option>
        <option value="done">Готово</option>
      </select>
    </div>
    <div class="task-table">
      <table>
        <thead>
          <tr><th>Название</th><th>Проект</th><th>Приоритет</th><th>Статус</th><th>Дедлайн</th></tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id">
            <td><strong>{{ task.title }}</strong><br><small>{{ task.description }}</small></td>
            <td>{{ task.project_name }}</td>
            <td>{{ task.priority === 'High' ? '🔴 Высокий' : (task.priority === 'Medium' ? '🟡 Средний' : '🟢 Низкий') }}</td>
            <td>
              <select :value="task.status" @change="updateStatus(task.id, $event.target.value)">
                <option value="todo">К выполнению</option>
                <option value="progress">В работе</option>
                <option value="review">На проверке</option>
                <option value="done">Готово</option>
              </select>
            </td>
            <td>{{ task.deadline || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '..//../stores/tasks'

const tasksStore = useTasksStore()
const statusFilter = ref('all')

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return tasksStore.tasks
  return tasksStore.tasks.filter(t => t.status === statusFilter.value)
})

async function updateStatus(taskId, newStatus) {
  await tasksStore.updateStatus(taskId, newStatus)
}

onMounted(async () => {
  await tasksStore.loadTasks()
})
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.top-bar select {
  width: auto;
  min-width: 180px;
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

@media (max-width: 768px) {
  th, td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
</style>