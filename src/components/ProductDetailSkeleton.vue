<script setup lang="ts">
const valueWidths = [70, 56, 78, 62, 74]
</script>

<template>
  <div class="layout">
    <div class="image"><span class="skeleton-block" /></div>

    <div class="details">
      <div class="card">
        <div class="head">
          <span class="skeleton-block title" />
          <span class="skeleton-block price" />
        </div>
        <div v-for="(width, n) in valueWidths" :key="n" class="row">
          <span class="skeleton-block icon" />
          <div class="text">
            <span class="skeleton-block label" />
            <span class="skeleton-block value" :style="{ width: `${width}%` }" />
          </div>
        </div>
      </div>

      <div class="card actions">
        <span class="skeleton-block legend" />
        <div class="pills">
          <span class="skeleton-block pill" />
        </div>
        <span class="skeleton-block legend" />
        <div class="pills">
          <span class="skeleton-block pill" />
          <span class="skeleton-block pill" />
        </div>
        <span class="skeleton-block button" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  align-items: start;
}

.image {
  aspect-ratio: 1;
  padding: var(--space-5);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card {
  padding: var(--space-5);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.image .skeleton-block {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-xl);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.title {
  width: 50%;
  height: 1.5rem;
}

.price {
  width: 5rem;
  height: 2rem;
}

.row {
  display: grid;
  grid-template-columns: 2rem 1fr;
  column-gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) 0;
  border-top: 1px solid var(--color-border);
}

.icon {
  width: 2rem;
  height: 2rem;
}

.text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  width: 25%;
  height: 0.625rem;
}

.value {
  height: 0.875rem;
}

.legend {
  width: 4rem;
  height: 0.875rem;
  margin-bottom: var(--space-2);
}

.pills {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.pill {
  width: 5rem;
  height: 2.625rem;
  border-radius: var(--radius-pill);
}

.button {
  height: 3rem;
  margin-top: var(--space-3);
  border-radius: var(--radius-pill);
}

@media (max-width: 40rem) {
  .layout {
    grid-template-columns: 1fr;
  }

  .image {
    aspect-ratio: 16 / 10;
    padding: var(--space-3);
  }

  .price,
  .actions {
    display: none;
  }
}
</style>
