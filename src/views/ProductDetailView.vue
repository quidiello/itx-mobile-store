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
      <RouterLink to="/">Back to the product list</RouterLink>
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
