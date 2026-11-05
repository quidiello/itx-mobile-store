<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { ProductDetail } from '@/api/schemas'
import { formatPrice } from '@/utils/formatPrice'
import { productName } from '@/utils/productName'
import type { Component } from 'vue'
import ChevronIcon from './icons/ChevronIcon.vue'
import BatteryIcon from './icons/specs/BatteryIcon.vue'
import CameraIcon from './icons/specs/CameraIcon.vue'
import CpuIcon from './icons/specs/CpuIcon.vue'
import DimensionsIcon from './icons/specs/DimensionsIcon.vue'
import OsIcon from './icons/specs/OsIcon.vue'
import RamIcon from './icons/specs/RamIcon.vue'
import ResolutionIcon from './icons/specs/ResolutionIcon.vue'
import ScreenIcon from './icons/specs/ScreenIcon.vue'
import WeightIcon from './icons/specs/WeightIcon.vue'
import SpecIcon from './SpecIcon.vue'

const props = defineProps<{ product: ProductDetail }>()

interface Row {
  label: string
  value: string | null
  icon: Component
  main: boolean
}

const listId = useId()
const expanded = ref(false)

const name = computed(() => productName(props.product))

const unavailable = computed(() => props.product.price === null)

const rows = computed<Row[]>(() => {
  const { product } = props
  return [
    { label: 'CPU', value: product.cpu, icon: CpuIcon, main: true },
    { label: 'RAM', value: product.ram, icon: RamIcon, main: true },
    { label: 'Screen size', value: product.screenSize, icon: ScreenIcon, main: true },
    { label: 'Battery', value: product.battery, icon: BatteryIcon, main: true },
    { label: 'Primary camera', value: product.primaryCamera, icon: CameraIcon, main: true },
    { label: 'Operating system', value: product.os, icon: OsIcon, main: false },
    {
      label: 'Screen resolution',
      value: product.screenResolution,
      icon: ResolutionIcon,
      main: false,
    },
    { label: 'Secondary camera', value: product.secondaryCamera, icon: CameraIcon, main: false },
    { label: 'Dimensions', value: product.dimensions, icon: DimensionsIcon, main: false },
    {
      label: 'Weight',
      value: product.weight === null ? null : `${product.weight} g`,
      icon: WeightIcon,
      main: false,
    },
  ]
})

const hiddenCount = computed(() => rows.value.filter((row) => !row.main).length)
</script>

<template>
  <div>
    <div class="head">
      <h1>{{ name }}</h1>
      <p class="price" :class="{ unavailable }">{{ formatPrice(product.price) }}</p>
    </div>
    <dl :id="listId">
      <div v-for="row in rows" :key="row.label" class="row" :hidden="!row.main && !expanded">
        <dt>
          <SpecIcon><component :is="row.icon" /></SpecIcon>
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
      <ChevronIcon :direction="expanded ? 'up' : 'down'" />
    </button>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

h1 {
  min-width: 0;
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.25;
}

.price {
  flex: none;
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
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

@media (max-width: 40rem) {
  .head {
    margin-bottom: var(--space-3);
  }

  h1 {
    font-size: var(--text-lg);
  }

  .price {
    display: none;
  }
}
</style>
