<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackToTop from '@/components/BackToTop.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import SearchBar from '@/components/SearchBar.vue'
import { useProducts } from '@/composables/useProducts'
import { filterProducts } from '@/utils/filterProducts'

const route = useRoute()
const router = useRouter()
const { products, loading, error, reload } = useProducts()

const query = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (text) => {
    router.replace({ query: { ...route.query, q: text.trim() ? text : undefined } })
  },
})

const visibleProducts = computed(() => filterProducts(products.value, query.value))
</script>

<template>
  <main>
    <PageToolbar>
      <SearchBar v-model="query" />
    </PageToolbar>

    <div v-if="loading" class="grid" aria-busy="true">
      <p class="sr-only" role="status">Loading products</p>
      <ProductCardSkeleton v-for="n in 8" :key="n" :index="n" aria-hidden="true" />
    </div>
    <div v-else-if="error" role="alert">
      <p>Products could not be loaded</p>
      <button type="button" @click="reload">Retry</button>
    </div>
    <p v-else-if="products.length === 0">No products available</p>
    <p v-else-if="visibleProducts.length === 0">No products match "{{ query }}"</p>
    <ul v-else class="grid">
      <li v-for="product in visibleProducts" :key="product.id">
        <ProductCard :product="product" />
      </li>
    </ul>

    <BackToTop />
  </main>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(max(12rem, calc((100% - 4.5rem) / 4)), 1fr));
  gap: var(--space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
