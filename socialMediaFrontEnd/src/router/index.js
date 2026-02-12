import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { requiresAuth: true },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/chatting',
      name: 'chatting',
      meta: { requiresAuth: true },
      component: () => import('../views/ChattingView.vue'),
      children: [
        {
          path: 'room/:name/:id', // Nested route
          meta: { requiresAuth: true },
          component: () => import('../components/messageComponent.vue'), // Loaded into MainView's router-view
        },
      ],
    },
    {
      path: '/call/:roomId/:callId',
      name: 'call',
      component: () => import('../views/CallView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/detailedUser/:id',
      name: 'detailedUser',
      meta: { requiresAuth: true },
      component: () => import('../views/DetailedUserView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && (localStorage.getItem('token') === null)) {
    next('/login')
  } else {
    next()
  }
})

export default router

