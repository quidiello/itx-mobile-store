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
      <li v-if="isProductList" aria-current="page">Home</li>
      <li v-else><RouterLink to="/">Home</RouterLink></li>
      <ProductBreadcrumb v-if="isProductDetail" :id="String(route.params.id)" />
    </ol>
  </nav>
</template>

<style scoped>
ol {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

li[aria-current='page'] {
  color: var(--color-text);
  font-weight: 500;
}

li + li::before {
  content: '/';
  margin-right: var(--space-2);
  color: var(--color-text-muted);
}
</style>
