<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { ProductDetail } from '@/api/schemas'
import { formatPrice } from '@/utils/formatPrice'
import SpecIcon from './SpecIcon.vue'
import type { SpecIconName } from './specIcons'

const props = defineProps<{ product: ProductDetail }>()

interface Row {
  label: string
  value: string | null
  icon: SpecIconName
  main: boolean
}

const listId = useId()
const expanded = ref(false)

const name = computed(
  () => [props.product.brand, props.product.model].filter(Boolean).join(' ') || 'Product',
)

const unavailable = computed(() => props.product.price === null)

const rows = computed<Row[]>(() => {
  const { product } = props
  return [
    { label: 'CPU', value: product.cpu, icon: 'cpu', main: true },
    { label: 'RAM', value: product.ram, icon: 'ram', main: true },
    { label: 'Screen size', value: product.screenSize, icon: 'screen', main: true },
    { label: 'Battery', value: product.battery, icon: 'battery', main: true },
    { label: 'Primary camera', value: product.primaryCamera, icon: 'camera', main: true },
    { label: 'Operating system', value: product.os, icon: 'os', main: false },
    {
      label: 'Screen resolution',
      value: product.screenResolution,
      icon: 'resolution',
      main: false,
    },
    { label: 'Secondary camera', value: product.secondaryCamera, icon: 'camera', main: false },
    { label: 'Dimensions', value: product.dimensions, icon: 'dimensions', main: false },
    {
      label: 'Weight',
      value: product.weight === null ? null : `${product.weight} g`,
      icon: 'weight',
      main: false,
    },
  ]
})

const hiddenCount = computed(() => rows.value.filter((row) => !row.main).length)
</script>

<template>
  <div class="description">
    <h1>{{ name }}</h1>
    <p class="price" :class="{ unavailable }">{{ formatPrice(product.price) }}</p>
    <dl :id="listId">
      <div v-for="row in rows" :key="row.label" class="row" :hidden="!row.main && !expanded">
        <dt>
          <SpecIcon :name="row.icon" />
          <span class="label">{{ row.label }}</span>
        </dt>
        <dd>{{ row.value ?? '—' }}</dd>
      </div>
    </dl>
    <button
      type="button"
      class="toggle"
      :aria-expanded="expanded"
      :aria-controls="listId"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show fewer' : `Show ${hiddenCount} more` }}
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        :class="{ open: expanded }"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.25;
}

.price {
  margin: var(--space-1) 0 var(--space-4);
  font-size: var(--text-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.price.unavailable {
  color: var(--color-text-muted);
  font-size: var(--text-base);
  font-weight: 400;
}

dl {
  margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 2rem 1fr;
  column-gap: var(--space-3);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
}

.row[hidden] {
  display: none;
}

dt {
  display: contents;
}

dt :deep(.icon) {
  grid-column: 1;
  grid-row: 1 / span 2;
  align-self: center;
}

.label {
  grid-column: 2;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

dd {
  grid-column: 2;
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  width: 100%;
  padding: var(--space-3) 0 0;
  border-top: 1px solid var(--color-border);
  border-radius: 0;
  background: none;
  color: var(--color-accent);
  font-size: var(--text-sm);
}

.toggle:hover:not(:disabled) {
  background: none;
  color: var(--color-accent-hover);
}

.toggle svg {
  transition: transform 0.2s ease;
}

.toggle svg.open {
  transform: rotate(180deg);
}
</style>
