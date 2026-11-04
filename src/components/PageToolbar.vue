<script setup lang="ts">
import AppBreadcrumbs from './AppBreadcrumbs.vue'
</script>

<template>
  <div class="toolbar">
    <div class="trail">
      <slot name="leading" />
      <AppBreadcrumbs />
    </div>
    <div v-if="$slots.default" class="actions"><slot /></div>
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

.trail {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.actions {
  display: flex;
  flex: 1 1 auto;
  justify-content: flex-end;
}
</style>
