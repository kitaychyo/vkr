import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/match/:id',
        name: 'match',
        component: () => import('@/views/MatchDetail.vue'),
        props: true
    },
    {
        path: '/history',
        name: 'history',
        component: () => import('@/views/History.vue')
    },
    /*
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutView.vue') // Ленивая загрузка
    },
    {
        path: '/user/:id',
        name: 'user',
        component: () => import('@/views/UserView.vue'),
        props: true // Передача параметров как props
    }
    */
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router