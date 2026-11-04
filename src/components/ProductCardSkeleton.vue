<script setup lang="ts">
defineProps<{ index?: number }>()

const modelWidths = [78, 62, 70, 84]
</script>

<template>
  <div class="card">
    <div class="image"><span class="block" /></div>
    <div class="row">
      <div class="info">
        <span class="block brand" />
        <span
          class="block model"
          :style="{ width: `${modelWidths[(index ?? 0) % modelWidths.length]}%` }"
        />
      </div>
      <span class="block price" />
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.image {
  aspect-ratio: 1;
  margin-bottom: var(--space-3);
  padding: var(--space-2);
}

.block {
  display: block;
  border-radius: var(--radius-md);
  background: var(--color-border);
  animation: pulse 1.2s ease-in-out infinite;
}

.image .block {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-xl);
}

.row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: auto;
}

.info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.brand {
  width: 35%;
  height: 0.75rem;
}

.model {
  height: 1rem;
}

.price {
  flex: none;
  width: 3.25rem;
  height: 1.5rem;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .block {
    animation: none;
  }
}
</style>
