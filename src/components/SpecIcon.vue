<script setup lang="ts">
import { specIcons, type SpecIconName } from './specIcons'

defineProps<{ name: SpecIconName }>()
</script>

<template>
  <span class="icon" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path v-for="path in specIcons[name]" :key="path" :d="path" />
    </svg>
  </span>
</template>

<style scoped>
.icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
