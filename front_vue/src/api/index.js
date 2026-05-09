import axios from 'axios'

// Создаём экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: '/api',               // проксируется Vite на Django http://localhost:8080/api
  withCredentials: true,         // отправлять cookies (сессия)
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken'
})

export default api

// ========== АВТОРИЗАЦИЯ ==========
export async function getCurrentUser() {
  try {
    const res = await api.get('/users/me/')
    return res.data
  } catch {
    return null
  }
}

export async function login(username, password) {
  const res = await api.post('/users/login/', { username, password })
  return res.data
}

export async function logout() {
  await api.post('/users/logout/')
}

export async function register(userData) {
  const res = await api.post('/users/', userData)
  return res.data
}

// ========== ПРОЕКТЫ ==========
export async function fetchProjects() {
  const res = await api.get('/tasks/projects/')
  return res.data
}

export async function createProject(data) {
  const res = await api.post('/tasks/projects/', data)
  return res.data
}

export async function updateProject(id, data) {
  const res = await api.put(`/tasks/projects/${id}/`, data)
  return res.data
}

export async function deleteProject(id) {
  await api.delete(`/tasks/projects/${id}/`)
}

// ========== ЗАДАЧИ ПРОЕКТА ==========
export async function fetchProjectTasks(projectId) {
  const res = await api.get(`/tasks/projects/${projectId}/tasks/`)
  return res.data
}

export async function createProjectTask(projectId, data) {
  const res = await api.post(`/tasks/projects/${projectId}/tasks/`, data)
  return res.data
}

export async function updateProjectTask(projectId, taskId, data) {
  const res = await api.put(`/tasks/projects/${projectId}/tasks/${taskId}/`, data)
  return res.data
}

export async function deleteProjectTask(projectId, taskId) {
  await api.delete(`/tasks/projects/${projectId}/tasks/${taskId}/`)
}

// ========== ЛИЧНЫЕ ЗАДАЧИ ==========
export async function fetchMyTasks() {
  const res = await api.get('/tasks/tasks/')
  return res.data
}

export async function updateTaskStatus(taskId, status) {
  const res = await api.patch(`/tasks/tasks/${taskId}/`, { status })
  return res.data
}

// ========== КОМАНДЫ ==========
export async function fetchTeams() {
  const res = await api.get('/teams/')
  return res.data
}

export async function createTeam(data) {
  const res = await api.post('/teams/', data)
  return res.data
}

export async function updateTeam(id, data) {
  const res = await api.put(`/teams/${id}/`, data)
  return res.data
}

export async function deleteTeam(id) {
  await api.delete(`/teams/${id}/`)
}

// ========== ПОЛЬЗОВАТЕЛИ (для выбора участников) ==========
export async function fetchUsers() {
  const res = await api.get('/users/')
  return res.data
}

// ========== ЧАТЫ ==========
// Чаты проектов
export async function fetchProjectMessages(projectId) {
  const res = await api.get(`/tasks/projects/${projectId}/messages/`)
  return res.data
}

export async function sendProjectMessage(projectId, text) {
  const res = await api.post(`/tasks/projects/${projectId}/messages/`, { text })
  return res.data
}

// Чаты задач
export async function fetchTaskMessages(taskId) {
  const res = await api.get(`/tasks/tasks/${taskId}/messages/`)
  return res.data
}

export async function sendTaskMessage(taskId, text) {
  const res = await api.post(`/tasks/tasks/${taskId}/messages/`, { text })
  return res.data
}