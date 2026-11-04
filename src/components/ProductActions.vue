<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProductDetail, ProductOption } from '@/api/schemas'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{ product: ProductDetail }>()

const cart = useCartStore()

const storageCode = ref<number | null>(null)
const colorCode = ref<number | null>(null)
const adding = ref(false)
const result = ref<'added' | 'failed' | null>(null)

const hasOptions = computed(
  () => props.product.options.storages.length > 0 && props.product.options.colors.length > 0,
)
const canAdd = computed(() => storageCode.value !== null && colorCode.value !== null)

function onlyOption(options: ProductOption[]) {
  return options.length === 1 ? (options[0]?.code ?? null) : null
}

watch(
  () => props.product,
  (product) => {
    storageCode.value = onlyOption(product.options.storages)
    colorCode.value = onlyOption(product.options.colors)
  },
  { immediate: true },
)

watch([storageCode, colorCode, () => props.product], () => {
  result.value = null
})

async function add() {
  if (storageCode.value === null || colorCode.value === null || adding.value) return

  adding.value = true
  result.value = null
  try {
    await cart.add({
      id: props.product.id,
      colorCode: colorCode.value,
      storageCode: storageCode.value,
    })
    result.value = 'added'
  } catch {
    result.value = 'failed'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <form @submit.prevent="add">
    <fieldset>
      <legend>Storage</legend>
      <label v-for="option in product.options.storages" :key="option.code">
        <input v-model="storageCode" type="radio" name="storage" :value="option.code" />
        {{ option.name }}
      </label>
    </fieldset>

    <fieldset>
      <legend>Color</legend>
      <label v-for="option in product.options.colors" :key="option.code">
        <input v-model="colorCode" type="radio" name="color" :value="option.code" />
        {{ option.name }}
      </label>
    </fieldset>

    <p v-if="!hasOptions">No options available</p>

    <button type="submit" :disabled="!canAdd || adding">
      {{ adding ? 'Adding…' : 'Add to cart' }}
    </button>

    <p role="status">{{ result === 'added' ? 'Added to cart' : '' }}</p>
    <p v-if="result === 'failed'" role="alert">Could not add the product. Please try again.</p>
  </form>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 0.5rem;
  font-weight: 600;
}
</style>
