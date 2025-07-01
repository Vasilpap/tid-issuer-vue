import { createRouter, createWebHistory } from 'vue-router';

const EmployeeView       = () => import('../views/Employee.vue');
const RepresentativeView = () => import('../views/Representative.vue');
const Unauthorized       = () => import('../views/Unauthorized.vue');

const routes = [
  { path: '/employee',       component: EmployeeView,       meta: { roles: ['Employee'] } },
  { path: '/representative', component: RepresentativeView, meta: { roles: ['Representative'] } },
  { path: '/unauthorized',   component: Unauthorized },
  { path: '/:catchAll(.*)',  redirect: '/employee' }, // or a landing page
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
