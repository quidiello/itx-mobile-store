<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ProductImagePlaceholder from './ProductImagePlaceholder.vue'

const props = defineProps<{
  src: string | null
  alt: string
}>()

const failed = ref(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const imageUrl = computed(() => (failed.value ? null : props.src))
</script>

<template>
  <div class="image">
    <img v-if="imageUrl" :src="imageUrl" :alt="alt" @error="failed = true" />
    <ProductImagePlaceholder v-else />
  </div>
</template>

<style scoped>
.image {
  aspect-ratio: 1;
  padding: var(--space-5);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
