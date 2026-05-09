<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Регистрация</h2>
      <input v-model="name" placeholder="Имя и фамилия" />
      <input v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Пароль" />
      <input type="password" v-model="password2" placeholder="Повторите пароль" />
      <button class="btn btn-primary" @click="submitRegister">Зарегистрироваться</button>
      <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')
const authStore = useAuthStore()
const router = useRouter()

async function submitRegister() {
  if (password.value !== password2.value) {
    alert('Пароли не совпадают')
    return
  }
  try {
    await authStore.register({
      username: email.value,
      email: email.value,
      first_name: name.value,
      password: password.value
    })
    router.push('/dashboard')
  } catch (error) {
    alert('Ошибка регистрации')
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