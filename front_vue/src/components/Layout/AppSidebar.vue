<template>
  <aside class="sidebar">
    <div class="logo">FlowCore.</div>
    <nav>
      <router-link to="/dashboard?section=tasks">✅ Задачи</router-link>
      <router-link to="/dashboard?section=projects">📁 Проекты</router-link>
      <router-link to="/dashboard?section=team">👥 Команда</router-link>
    </nav>
    <div class="user-info">
      {{ authStore.user?.username }}
      <button class="btn btn-primary"  @click="logout">Выйти</button>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '..//../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 2rem;
  flex-shrink: 0;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

nav a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

nav a:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

nav a.router-link-active {
  background: var(--bg-elevated);
  color: var(--accent-indigo);
}

.user-info {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 1rem;
  }
  .logo {
    font-size: 1.2rem;
    text-align: center;
  }
  nav a span:first-child {
    font-size: 1.2rem;
  }
  nav a span:last-child {
    display: none;
  }
  .user-info span {
    display: none;
  }
}

.btn-logout {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #EF4444;
  padding: 0.4rem 0.9rem;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: #EF4444;
  transform: translateY(-1px);
}

.btn-logout:active {
  transform: translateY(0);
}
</style>