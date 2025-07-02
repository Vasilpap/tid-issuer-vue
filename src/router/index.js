import { createRouter, createWebHistory } from 'vue-router';

import EmployeeView       from '@/views/EmployeeView.vue';
import RepresentativeView from '@/views/RepresentativeView.vue';
import Unauthorized       from '@/views/Unauthorized.vue';
import NotFound           from '@/views/NotFound.vue';

const routes = [
  /* Hit directly via guard above */
  { path: '/',           component: { template: '<div />' } },

  /* Dashboards */
  {
    path: '/employee',
    component: EmployeeView,
    meta: { roles: ['Employee'], title: 'Employee Dashboard' },
  },
  {
    path: '/representative',
    component: RepresentativeView,
    meta: { roles: ['Representative'], title: 'Representative Dashboard' },
  },

  /* Misc */
  { path: '/unauthorized', component: Unauthorized, meta: { title: 'Unauthorized' } },
  { path: '/:pathMatch(.*)*', component: NotFound, meta: { title: '404' } },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
