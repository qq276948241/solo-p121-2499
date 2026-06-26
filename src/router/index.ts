import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AddPage from '@/pages/AddPage.vue'
import DetailPage from '@/pages/DetailPage.vue'
import StatsPage from '@/pages/StatsPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/add',
    name: 'add',
    component: AddPage,
  },
  {
    path: '/movie/:id',
    name: 'detail',
    component: DetailPage,
    props: true,
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
