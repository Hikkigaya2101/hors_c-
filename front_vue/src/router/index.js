import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  await auth.checkAuth()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router