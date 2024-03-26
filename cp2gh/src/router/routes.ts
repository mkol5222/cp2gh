import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),
  //   children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  // },
  {
    path: '/',
    component: () => import('../scext/PolicyPage.vue') // import('../scext/APage.vue') // import('../scext/PolicyPage.vue') // import('pages/IndexPage.vue'), //import('../scext/PolicyPage.vue') //import('../scext/MainPage.vue')
  },
  {
    path: '/policy',
    component: () => import('../scext/PolicyPage.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
