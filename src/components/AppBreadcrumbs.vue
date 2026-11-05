<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import HomeIcon from './icons/ui/HomeIcon.vue'
import ProductBreadcrumb from './ProductBreadcrumb.vue'

const route = useRoute()

const isProductList = computed(() => route.name === 'product-list')
const isProductDetail = computed(() => route.name === 'product-detail')
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol>
      <li v-if="isProductList" class="home" aria-current="page"><HomeIcon />Home</li>
      <li v-else>
        <RouterLink to="/" class="home"><HomeIcon />Home</RouterLink>
      </li>
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
  min-height: 2.25rem;
  padding: 0 var(--space-4);
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

.home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

a.home {
  font-weight: 500;
}
</style>
