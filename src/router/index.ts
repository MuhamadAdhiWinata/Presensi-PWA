import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import HomeView from '../components/HomeView.vue'
import MonitoringView from '../components/MonitoringView.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginForm,
        meta: { guestOnly: true }
    },
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Monitoring',
        component: MonitoringView,
        meta: { requiresAuth: true, adminOnly: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, _from, next) => {
    const { isLoggedIn, user } = useAuth()

    if (to.meta.requiresAuth && !isLoggedIn.value) {
        next('/login')
    } else if (to.meta.guestOnly && isLoggedIn.value) {
        next('/')
    } else if (to.meta.adminOnly && user.value?.role !== 'admin') {
        next('/')
    } else {
        next()
    }
})

export default router
