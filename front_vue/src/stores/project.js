// src/stores/projects.js
import { defineStore } from 'pinia'
import { fetchProjects, createProject, updateProject, deleteProject, fetchProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask, fetchUsers } from '../api'

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [],
    users: []
  }),
  actions: {
    async loadProjects() {
      try {
        this.projects = await fetchProjects()
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error)
        throw error
      }
    },
    async loadUsers() {
      try {
        this.users = await fetchUsers()
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error)
        throw error
      }
    },
    async create(data) {
      try {
        const newProject = await createProject(data)
        this.projects.push(newProject)
        return newProject
      } catch (error) {
        console.error('Ошибка создания проекта:', error)
        throw error
      }
    },
    async update(id, data) {
      try {
        const updated = await updateProject(id, data)
        const index = this.projects.findIndex(p => p.id === id)
        if (index !== -1) this.projects[index] = updated
        return updated
      } catch (error) {
        console.error('Ошибка обновления проекта:', error)
        throw error
      }
    },
    async delete(id) {
      try {
        await deleteProject(id)
        this.projects = this.projects.filter(p => p.id !== id)
      } catch (error) {
        console.error('Ошибка удаления проекта:', error)
        throw error
      }
    },
    async loadTasks(projectId) {
      try {
        return await fetchProjectTasks(projectId)
      } catch (error) {
        console.error('Ошибка загрузки задач проекта:', error)
        throw error
      }
    },
    async createTask(projectId, data) {
      try {
        return await createProjectTask(projectId, data)
      } catch (error) {
        console.error('Ошибка создания задачи:', error)
        throw error
      }
    },
    async updateTask(projectId, taskId, data) {
      try {
        return await updateProjectTask(projectId, taskId, data)
      } catch (error) {
        console.error('Ошибка обновления задачи:', error)
        throw error
      }
    },
    async deleteTask(projectId, taskId) {
      try {
        await deleteProjectTask(projectId, taskId)
      } catch (error) {
        console.error('Ошибка удаления задачи:', error)
        throw error
      }
    }
  }
})