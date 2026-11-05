<template>
  <span class="icon" aria-hidden="true"><slot /></span>
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
