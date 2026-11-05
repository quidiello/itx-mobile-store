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
  --inset: var(--space-5);

  position: relative;
  aspect-ratio: 3 / 4;
  padding: var(--inset);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

img {
  position: absolute;
  inset: var(--inset);
  display: block;
  width: calc(100% - 2 * var(--inset));
  height: calc(100% - 2 * var(--inset));
  object-fit: contain;
}

@media (max-width: 40rem) {
  .image {
    --inset: var(--space-3);

    aspect-ratio: 16 / 10;
  }
}
</style>
