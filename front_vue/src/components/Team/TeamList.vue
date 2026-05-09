<template>
  <div>
    <div class="top-bar">
      <h2>Команды</h2>
      <button class="btn btn-primary" @click="openCreateModal">+ Создать команду</button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="teamStore.teams.length === 0" class="empty-state">
      Пока нет команд. Создайте первую команду.
    </div>
    <div v-else class="team-list">
      <div v-for="team in teamStore.teams" :key="team.id" class="team-card">
        <div class="team-header">
          <h3>{{ team.name }}</h3>
          <div class="team-actions">
            <button class="btn btn-outline btn-sm" @click="openEditModal(team)">✏️</button>
            <button class="btn btn-outline btn-sm" @click="deleteTeam(team.id)">🗑️</button>
          </div>
        </div>
        <p class="team-description">{{ team.description || 'Нет описания' }}</p>
        <div class="team-members">
          <strong>Участники:</strong>
          <span v-if="team.members_detail?.length">
            {{ team.members_detail.map(m => m.username).join(', ') }}
          </span>
          <span v-else>нет</span>
        </div>
        <div class="team-meta">
          <small>Создана: {{ formatDate(team.created_at) }}</small>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования команды -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ editingTeam ? 'Редактировать команду' : 'Создать команду' }}</h3>
        <input
          v-model="form.name"
          placeholder="Название команды"
          class="form-input"
        />
        <textarea
          v-model="form.description"
          placeholder="Описание (необязательно)"
          rows="3"
          class="form-input"
        ></textarea>
        <label class="form-label">Выберите участников</label>
        <select v-model="form.members" multiple size="5" class="form-input">
          <option v-for="user in allUsers" :key="user.id" :value="user.id">
            {{ user.username }} ({{ user.email }})
          </option>
        </select>
        <small class="form-hint">Удерживайте Ctrl для выбора нескольких</small>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeModal">Отмена</button>
          <button class="btn btn-primary" @click="saveTeam">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTeamStore } from '..//../stores/team'
import { useProjectsStore } from '..//../stores/project' // для получения списка пользователей

const teamStore = useTeamStore()
const projectsStore = useProjectsStore() // переиспользуем loadUsers
const loading = ref(false)
const modalVisible = ref(false)
const editingTeam = ref(null)
const allUsers = ref([])

const form = ref({
  name: '',
  description: '',
  members: []
})

async function loadData() {
  loading.value = true
  await teamStore.loadTeams()
  await projectsStore.loadUsers()
  allUsers.value = projectsStore.users
  loading.value = false
}

function openCreateModal() {
  editingTeam.value = null
  form.value = { name: '', description: '', members: [] }
  modalVisible.value = true
}

function openEditModal(team) {
  editingTeam.value = team
  form.value = {
    name: team.name,
    description: team.description || '',
    members: team.members || []
  }
  modalVisible.value = true
}

async function saveTeam() {
  if (!form.value.name.trim()) {
    alert('Введите название команды')
    return
  }
  const data = {
    name: form.value.name,
    description: form.value.description,
    members: form.value.members
  }
  if (editingTeam.value) {
    await teamStore.update(editingTeam.value.id, data)
  } else {
    await teamStore.create(data)
  }
  closeModal()
  await teamStore.loadTeams()
}

async function deleteTeam(id) {
  if (confirm('Удалить команду? Все связи с проектами будут потеряны.')) {
    await teamStore.delete(id)
  }
}

function closeModal() {
  modalVisible.value = false
  editingTeam.value = null
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => {
  loadData()
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

.team-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.2rem 1.5rem;
  transition: all 0.2s;
}

.team-card:hover {
  border-color: var(--accent-indigo);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.team-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.team-description {
  color: var(--text-secondary);
  margin: 0.5rem 0 0.8rem;
  font-size: 0.9rem;
}

.team-members {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.team-meta {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 20px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 28px;
  padding: 1.8rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid var(--border);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>