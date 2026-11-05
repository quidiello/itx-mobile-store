<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackToTop from '@/components/BackToTop.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductCardSkeleton from '@/components/ProductCardSkeleton.vue'
import ResultsCount from '@/components/ResultsCount.vue'
import SearchBar from '@/components/SearchBar.vue'
import StateMessage from '@/components/StateMessage.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useProducts } from '@/composables/useProducts'
import { filterProducts } from '@/utils/filterProducts'

usePageTitle('Products')

const route = useRoute()
const router = useRouter()
const { products, loading, error, reload } = useProducts()

const query = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (text) => {
    router.replace({ query: { ...route.query, q: text.trim() ? text : undefined } })
  },
})

const search = useTemplateRef('search')

function clearSearch() {
  query.value = ''
  search.value?.focus()
}

const visibleProducts = computed(() => filterProducts(products.value, query.value))
</script>

<template>
  <main tabindex="-1">
    <h1 class="sr-only">Products</h1>

    <PageToolbar>
      <SearchBar ref="search" v-model="query" />
    </PageToolbar>

    <div v-if="loading" class="grid" aria-busy="true">
      <p class="sr-only" role="status">Loading products</p>
      <ProductCardSkeleton v-for="n in 8" :key="n" :index="n" aria-hidden="true" />
    </div>
    <StateMessage
      v-else-if="error"
      icon="error"
      title="Couldn't load the products"
      description="Something went wrong while contacting the server. Check your connection and try again."
    >
      <button type="button" @click="reload">Try again</button>
    </StateMessage>
    <StateMessage
      v-else-if="products.length === 0"
      icon="empty"
      title="No products yet"
      description="There is nothing in the store right now. Come back in a little while."
    >
      <button type="button" class="secondary" @click="reload">Refresh</button>
    </StateMessage>
    <StateMessage
      v-else-if="visibleProducts.length === 0"
      icon="search"
      :title="`No products match &quot;${query}&quot;`"
      description="Check the spelling or try a different brand or model."
    >
      <button type="button" class="secondary" @click="clearSearch">Clear search</button>
    </StateMessage>
    <template v-else>
      <ResultsCount :shown="visibleProducts.length" :total="products.length" />
      <ul class="grid">
        <li v-for="product in visibleProducts" :key="product.id">
          <ProductCard :product="product" />
        </li>
      </ul>
    </template>

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
