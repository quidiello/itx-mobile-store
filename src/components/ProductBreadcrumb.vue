<script setup lang="ts">
import { computed } from 'vue'
import { useProduct } from '@/composables/useProduct'
import AppSkeleton from './AppSkeleton.vue'

const props = defineProps<{ id: string }>()

const { product, loading } = useProduct(() => props.id)

const name = computed(
  () => [product.value?.brand, product.value?.model].filter(Boolean).join(' ') || 'Product',
)
</script>

<template>
  <li aria-current="page">
    <AppSkeleton v-if="loading" width="8rem" />
    <template v-else>{{ name }}</template>
  </li>
</template>
