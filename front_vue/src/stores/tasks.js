import { defineStore } from 'pinia'
import { fetchMyTasks, updateTaskStatus } from '../api'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: []
  }),
  actions: {
    async loadTasks() {
      this.tasks = await fetchMyTasks()
    },
    async updateStatus(taskId, status) {
      await updateTaskStatus(taskId, status)
      const task = this.tasks.find(t => t.id === taskId)
      if (task) task.status = status
    }
  }
})