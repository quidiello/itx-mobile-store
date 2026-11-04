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
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

li + li::before {
  content: '>';
  margin-right: 0.5rem;
}
</style>
