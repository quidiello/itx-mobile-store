<script setup lang="ts">
import { computed } from 'vue'
import type { ProductDetail } from '@/api/schemas'
import { formatPrice } from '@/utils/formatPrice'

const props = defineProps<{ product: ProductDetail }>()

const rows = computed(() => {
  const { product } = props
  return [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Price', value: formatPrice(product.price) },
    { label: 'CPU', value: product.cpu },
    { label: 'RAM', value: product.ram },
    { label: 'Operating system', value: product.os },
    { label: 'Screen size', value: product.screenSize },
    { label: 'Screen resolution', value: product.screenResolution },
    { label: 'Battery', value: product.battery },
    { label: 'Primary camera', value: product.primaryCamera },
    { label: 'Secondary camera', value: product.secondaryCamera },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Weight', value: product.weight === null ? null : `${product.weight} g` },
  ]
})
</script>

<template>
  <dl>
    <div v-for="row in rows" :key="row.label" class="row">
      <dt>{{ row.label }}</dt>
      <dd>{{ row.value ?? '—' }}</dd>
    </div>
  </dl>
</template>

<style scoped>
dl {
  margin: 0;
}

.row {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.row:last-child {
  border-bottom: 0;
}

dt {
  flex: 0 0 9rem;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

dd {
  margin: 0;
  font-weight: 500;
}
</style>
