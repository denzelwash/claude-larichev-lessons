import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home').then((m) => m.HomePage),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login').then((m) => m.LoginPage),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/register').then((m) => m.RegisterPage),
      meta: { guest: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/pages/transactions').then((m) => m.TransactionsPage),
      meta: { requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/pages/categories').then((m) => m.CategoriesPage),
      meta: { requiresAuth: true },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/pages/terms').then((m) => m.TermsPage),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/pages/privacy').then((m) => m.PrivacyPage),
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.token && !auth.user) {
    await auth.fetchMe().catch(() => auth.logout());
  }
  if (to.meta.requiresAuth && !auth.user) return { name: 'login' };
  if (to.meta.guest && auth.user) return { name: 'home' };
});
