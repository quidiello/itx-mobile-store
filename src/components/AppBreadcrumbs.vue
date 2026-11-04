<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ProductBreadcrumb from './ProductBreadcrumb.vue'

const route = useRoute()

const isProductList = computed(() => route.name === 'product-list')
const isProductDetail = computed(() => route.name === 'product-detail')
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol>
      <li v-if="isProductList" class="home" aria-current="page">Home</li>
      <li v-else><RouterLink to="/" class="home">Home</RouterLink></li>
      <ProductBreadcrumb v-if="isProductDetail" :id="String(route.params.id)" />
    </ol>
  </nav>
</template>

<style scoped>
nav {
  min-width: 0;
  max-width: 100%;
}

ol {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  list-style: none;
}

li {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

li[aria-current='page'] {
  color: var(--color-text);
  font-weight: 500;
}

li + li {
  padding-left: 1.25rem;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239aa1ae' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 6 6 6-6 6'/%3E%3C/svg%3E")
    no-repeat left center / 1rem;
}

.home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.home::before {
  content: '';
  width: 1rem;
  height: 1rem;
  background: currentcolor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 11 9-8 9 8'/%3E%3Cpath d='M5 10v10h14V10'/%3E%3C/svg%3E")
    no-repeat center / contain;
}

a.home {
  font-weight: 500;
}
</style>
