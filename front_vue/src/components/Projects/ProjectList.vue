<template>
  <div>
    <div class="top-bar">
      <h2>Проекты</h2>
      <button class="btn btn-primary" @click="openCreateModal">+ Создать проект</button>
    </div>
    <div v-if="loadingProjects" class="loading">Загрузка...</div>
    <div v-else-if="projectsStore.projects.length === 0" class="empty-state">
      Нет проектов. Создайте первый.
    </div>
    <div v-else class="project-grid">
      <div v-for="project in projectsStore.projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm" @click="openEditModal(project)">✏️</button>
          <button class="btn btn-outline btn-sm" @click="deleteProject(project.id)">🗑️</button>
          <!--button class="btn btn-outline btn-sm" @click="openProject(project.id)">📋 Открыть</button-->
          <button class="btn btn-outline btn-sm" @click="openTaskModalForProject(project.id)">➕ Задача</button>
<button class="btn btn-outline btn-sm" @click="chatStore.openProjectChat(project.id, project.name)">
  💬 Чат
</button>
        </div>
      </div>
    </div>
    <ProjectModal 
      v-if="projectModalVisible" 
      :project="editingProject" 
      @close="projectModalVisible=false" 
      @saved="onProjectSaved" 
    />
    <!-- Модальное окно создания задачи -->
    <TaskModal
      v-if="taskModalVisible"
      :project-id="currentProjectIdForTask"
      :task="null"
      @close="taskModalVisible=false"
      @saved="onTaskSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '../..//stores/project'
import { useRouter } from 'vue-router'
import ProjectModal from './ProjectModal.vue'
import TaskModal from './TaskModal.vue'   // создадим этот компонент
import { useChatStore } from '..//../stores/chat'
const projectsStore = useProjectsStore()
const router = useRouter()
const projectModalVisible = ref(false)
const editingProject = ref(null)
const loadingProjects = ref(false)
const chatStore = useChatStore()
// для задачи
const taskModalVisible = ref(false)
const currentProjectIdForTask = ref(null)

async function loadProjects() {
  loadingProjects.value = true
  try {
    await projectsStore.loadProjects()
  } catch (error) {
    alert('Ошибка загрузки проектов')
  } finally {
    loadingProjects.value = false
  }
}

function openProjectChat(id, name) {
  chatStore.openChat('project', id, name)
}

async function  deleteProject(id) {
  if (confirm('Удалить проект?')) {
    try {
      await projectsStore.delete(id)
    } catch (error) {
      alert('Не удалось удалить проект')
    }
  }
}

function openCreateModal() {
  editingProject.value = null
  projectModalVisible.value = true
}

function openEditModal(project) {
  editingProject.value = project
  projectModalVisible.value = true
}

function openProject(id) {
  router.push(`/dashboard/project/${id}`)
}

function openTaskModalForProject(projectId) {
  currentProjectIdForTask.value = projectId
  taskModalVisible.value = true
}

async function onProjectSaved() {
  projectModalVisible.value = false
  await loadProjects()
}

async function onTaskSaved() {
  taskModalVisible.value = false
  // можно не перезагружать проекты, но для обновления числа задач — перезагрузим
  await loadProjects()
}

onMounted(() => {
  loadProjects()
})
</script>