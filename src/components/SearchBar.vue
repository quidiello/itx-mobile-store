<script setup lang="ts">
import { useId } from 'vue'

const query = defineModel<string>({ required: true })
const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="sr-only">Search by brand or model</label>
    <input :id="inputId" v-model="query" type="search" placeholder="Search by brand or model" />
  </div>
</template>

<style scoped>
div {
  width: 100%;
  max-width: 24rem;
}

input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235b6475' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.5-3.5'/%3E%3C/svg%3E")
    no-repeat 1rem center / 1.125rem;
  color: var(--color-text);
  font: inherit;
  box-shadow: var(--shadow-sm);
}

input::placeholder {
  color: var(--color-text-muted);
}

input:focus-visible {
  border-color: var(--color-accent);
  outline-offset: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
