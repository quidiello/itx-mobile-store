<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppSkeleton from '@/components/AppSkeleton.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import ProductActions from '@/components/ProductActions.vue'
import ProductDescription from '@/components/ProductDescription.vue'
import ProductImage from '@/components/ProductImage.vue'
import { useProduct } from '@/composables/useProduct'

const route = useRoute()
const { product, loading, error, reload } = useProduct(() => String(route.params.id))

const name = computed(
  () => [product.value?.brand, product.value?.model].filter(Boolean).join(' ') || 'Product',
)
</script>

<template>
  <main>
    <PageToolbar>
      <template #leading>
        <RouterLink to="/" class="back" aria-label="Back to the product list">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </RouterLink>
      </template>
    </PageToolbar>

    <div v-if="loading" class="layout">
      <AppSkeleton height="20rem" />
      <div class="details">
        <AppSkeleton v-for="n in 6" :key="n" />
      </div>
    </div>
    <div v-else-if="error || !product" role="alert">
      <p>Product could not be loaded</p>
      <button type="button" @click="reload">Retry</button>
    </div>
    <template v-else>
      <h1>{{ name }}</h1>
      <div class="layout">
        <ProductImage :src="product.imgUrl" :alt="name" />
        <div class="details">
          <ProductDescription :product="product" />
          <ProductActions :product="product" />
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.back {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  transition: color 0.2s ease;
}

.back:hover {
  color: var(--color-accent);
  text-decoration: none;
}

.layout .skeleton {
  background: var(--color-surface);
}

.layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  align-items: start;
}

.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 40rem) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
