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
    <span class="price">{{ formatPrice(product.price) }}</span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: inherit;
  text-decoration: none;
}

.image {
  aspect-ratio: 1;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.model,
.price {
  font-weight: 600;
}
</style>
