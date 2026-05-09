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
          <button class="btn btn-outline btn-sm" @click="openProject(project.id)">📋 Открыть</button>
        </div>
      </div>
    </div>
    <ProjectModal 
      v-if="modalVisible" 
      :project="editingProject" 
      @close="modalVisible=false" 
      @saved="onProjectSaved" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '..//..//stores/project'
import { useRouter } from 'vue-router'
import ProjectModal from './ProjectModal.vue'

const projectsStore = useProjectsStore()
const router = useRouter()
const modalVisible = ref(false)
const editingProject = ref(null)
const loadingProjects = ref(false)

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

async function deleteProject(id) {
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
  modalVisible.value = true
}

function openEditModal(project) {
  editingProject.value = project
  modalVisible.value = true
}

function openProject(id) {
  router.push(`/dashboard/project/${id}`)
}

async function onProjectSaved() {
  modalVisible.value = false
  await loadProjects()
}

onMounted(() => {
  loadProjects()
})
</script>