<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
}>()
</script>

<template>
  <span class="skeleton skeleton-block" :style="{ width, height }">
    <span class="sr-only">Loading</span>
  </span>
</template>

<style scoped>
.skeleton {
  height: 1em;
}
</style>
