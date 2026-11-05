<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
}>()
</script>

<template>
  <span class="skeleton" :style="{ width, height }">
    <span class="sr-only">Loading</span>
  </span>
</template>

<style scoped>
.skeleton {
  display: block;
  height: 1em;
  border-radius: var(--radius-md);
  background: var(--color-border);
  animation: pulse 1.2s ease-in-out infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
