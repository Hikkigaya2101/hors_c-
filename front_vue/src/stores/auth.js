import { defineStore } from 'pinia'
import { login, logout, getCurrentUser, register } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),
  actions: {
    async login(username, password) {
      const user = await login(username, password)
      this.user = user
      this.isAuthenticated = true
      return user
    },
    async register(data) {
      const user = await register(data)
      this.user = user
      this.isAuthenticated = true
      return user
    },
    async logout() {
      await logout()
      this.user = null
      this.isAuthenticated = false
    },
    async checkAuth() {
      const user = await getCurrentUser()
      if (user) {
        this.user = user
        this.isAuthenticated = true
      }
      return !!user
    }
  }
})