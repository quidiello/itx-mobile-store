<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Product } from '@/api/schemas'
import { useImageFallback } from '@/composables/useImageFallback'
import { formatPrice } from '@/utils/formatPrice'
import ProductImagePlaceholder from './ProductImagePlaceholder.vue'

const props = defineProps<{ product: Product }>()

const { url: imageUrl, onError } = useImageFallback(() => props.product.imgUrl)
</script>

<template>
  <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="card">
    <div class="image">
      <img v-if="imageUrl" :src="imageUrl" alt="" loading="lazy" @error="onError" />
      <ProductImagePlaceholder v-else />
    </div>
    <div class="row">
      <div class="info">
        <span v-if="product.brand" class="brand">{{ product.brand }}</span>
        <span v-if="product.model" class="model">{{ product.model }}</span>
        <span v-if="!product.brand && !product.model" class="model">Unnamed product</span>
      </div>
      <span class="price" :class="{ unavailable: product.price === null }">{{
        formatPrice(product.price)
      }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
    box-shadow 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.card:hover {
  color: var(--color-text);
  text-decoration: none;
  position: relative;
  z-index: 1;
  box-shadow: var(--shadow-md);
  transform: scale(1.03);
}

.image {
  --inset: var(--space-2);

  position: relative;
  aspect-ratio: 3 / 4;
  margin-bottom: var(--space-3);
  padding: var(--inset);
}

img {
  position: absolute;
  inset: var(--inset);
  display: block;
  width: calc(100% - 2 * var(--inset));
  height: calc(100% - 2 * var(--inset));
  object-fit: contain;
}

.brand {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: auto;
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.model {
  font-weight: 500;
  text-wrap: balance;
}

.price {
  flex: none;
  font-size: var(--text-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.price.unavailable {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 400;
}

@media (prefers-reduced-motion: reduce) {
  .card:hover {
    transform: none;
  }
}
</style>
