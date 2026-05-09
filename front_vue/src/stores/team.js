import { defineStore } from 'pinia'
import { fetchTeams, createTeam, deleteTeam, updateTeam } from './/../api'

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: []
  }),
  actions: {
    async loadTeams() {
      this.teams = await fetchTeams()
    },
    async create(data) {
      const newTeam = await createTeam(data)
      this.teams.push(newTeam)
      return newTeam
    },
    async update(id, data) {
      const updated = await updateTeam(id, data)
      const index = this.teams.findIndex(t => t.id === id)
      if (index !== -1) this.teams[index] = updated
      return updated
    },
    async delete(id) {
      await deleteTeam(id)
      this.teams = this.teams.filter(t => t.id !== id)
    }
  }
})