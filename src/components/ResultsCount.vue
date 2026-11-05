<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ shown: number; total: number }>()

const ANNOUNCE_DELAY_MS = 500

const rest = computed(() =>
  props.shown === props.total
    ? props.total === 1
      ? 'product'
      : 'products'
    : `of ${props.total} products`,
)
const label = computed(() => `${props.shown} ${rest.value}`)

const announcement = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

// Se espera a que el usuario deje de escribir para no leer un número por cada letra.
watch(label, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    announcement.value = value
  }, ANNOUNCE_DELAY_MS)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <p class="count">
    <strong>{{ shown }}</strong> {{ rest }}
  </p>
  <p class="sr-only" role="status">{{ announcement }}</p>
</template>

<style scoped>
.count {
  margin: 0 0 var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  text-align: right;
}

.count strong {
  color: var(--color-text);
  font-weight: 600;
}
</style>
