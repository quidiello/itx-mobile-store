import type { RouteRecordRaw } from 'vue-router'
import ProductListView from '@/views/ProductListView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'product-list',
    component: ProductListView,
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
