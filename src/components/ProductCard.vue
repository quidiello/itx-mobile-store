<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/api/schemas'
import { formatPrice } from '@/utils/formatPrice'
import ProductImagePlaceholder from './ProductImagePlaceholder.vue'

const props = defineProps<{ product: Product }>()

const imageFailed = ref(false)
watch(
  () => props.product.imgUrl,
  () => {
    imageFailed.value = false
  },
)

const imageUrl = computed(() => (imageFailed.value ? null : props.product.imgUrl))
</script>

<template>
  <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="card">
    <div class="image">
      <img v-if="imageUrl" :src="imageUrl" alt="" loading="lazy" @error="imageFailed = true" />
      <ProductImagePlaceholder v-else />
    </div>
    <span v-if="product.brand" class="brand">{{ product.brand }}</span>
    <div class="row">
      <span v-if="product.model" class="model">{{ product.model }}</span>
      <span v-if="!product.brand && !product.model" class="model">Unnamed product</span>
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
  border-radius: var(--radius-xl);
  background: var(--color-surface);
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
  aspect-ratio: 1;
  margin-bottom: var(--space-3);
  padding: var(--space-2);
}

img {
  display: block;
  width: 100%;
  height: 100%;
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
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: auto;
}

.model {
  min-width: 0;
  font-weight: 500;
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
