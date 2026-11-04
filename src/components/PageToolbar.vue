<script setup lang="ts">
import AppBreadcrumbs from './AppBreadcrumbs.vue'
</script>

<template>
  <div class="toolbar">
    <AppBreadcrumbs />
    <div class="actions"><slot /></div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-4);
  margin-bottom: var(--space-5);
}

.actions {
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
}
</style>
