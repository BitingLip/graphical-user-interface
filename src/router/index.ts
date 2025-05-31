import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Lazy load components for better performance
const DashboardView = () => import('@/views/DashboardView.vue')
const ClustersView = () => import('@/views/ClustersView.vue')
const ModelsView = () => import('@/views/ModelsView.vue')
const TasksView = () => import('@/views/TasksView.vue')
const WorkersView = () => import('@/views/WorkersView.vue')
const MonitoringView = () => import('@/views/MonitoringView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const LoginView = () => import('@/views/LoginView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/clusters',
    name: 'Clusters',
    component: ClustersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/models',
    name: 'Models',
    component: ModelsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksView,
    meta: { requiresAuth: true }
  },
  {
    path: '/workers',
    name: 'Workers',
    component: WorkersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: MonitoringView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
