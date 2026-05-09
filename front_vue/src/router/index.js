import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }},

    {
  path: '/dashboard/project/:id',
  component: () => import('../components/Projects/ProjectDetail.vue'),
  meta: { requiresAuth: true }
}
  
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  await auth.checkAuth()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) {
    return '/dashboard'
  }
  // возвращаем true или undefined для продолжения
  return true
})

export default router