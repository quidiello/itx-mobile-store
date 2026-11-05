<script setup lang="ts">
import { computed } from 'vue'
import { useProduct } from '@/composables/useProduct'
import AppSkeleton from './AppSkeleton.vue'
import ChevronIcon from './icons/ChevronIcon.vue'

const props = defineProps<{ id: string }>()

const { product, loading } = useProduct(() => props.id)

const name = computed(
  () => [product.value?.brand, product.value?.model].filter(Boolean).join(' ') || 'Product',
)
</script>

<template>
  <li class="crumb" aria-current="page" :title="loading ? undefined : name">
    <ChevronIcon class="separator" direction="right" />
    <span class="name">
      <AppSkeleton v-if="loading" width="8rem" />
      <template v-else>{{ name }}</template>
    </span>
  </li>
</template>

<style scoped>
.crumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.separator {
  flex: none;
  color: var(--color-text-muted);
  opacity: 0.7;
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
