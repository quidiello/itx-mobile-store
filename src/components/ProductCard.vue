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
    <span v-if="product.model" class="model">{{ product.model }}</span>
    <span v-if="!product.brand && !product.model" class="model">Unnamed product</span>
    <span class="price" :class="{ unavailable: product.price === null }">{{
      formatPrice(product.price)
    }}</span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
  text-decoration: none;
  transform: translateY(-2px);
}

.image {
  aspect-ratio: 1;
  margin-bottom: var(--space-3);
  padding: var(--space-2);
}

.brand {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.model {
  font-weight: 500;
}

.price {
  margin-top: auto;
  padding-top: var(--space-3);
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.price.unavailable {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card:hover {
    transform: none;
  }
}
</style>
