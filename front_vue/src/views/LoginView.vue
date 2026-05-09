<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Вход</h2>
      <input v-model="username" placeholder="Логин" />
      <input type="password" v-model="password" placeholder="Пароль" />
      <button class="btn btn-primary" @click="submitLogin">Войти</button>
      <p>Нет аккаунта? <router-link to="/register">Регистрация</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

async function submitLogin() {
  try {
    await authStore.login(username.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    alert('Ошибка входа')
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: var(--bg-primary);
}

.auth-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  animation: fadeIn 0.3s ease;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

input {
  margin-bottom: 1rem;
}

.btn-primary {
  width: 100%;
  margin-top: 0.5rem;
}

p {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-secondary);
}

a {
  color: var(--accent-green);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>