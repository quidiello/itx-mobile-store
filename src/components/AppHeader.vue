<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppBreadcrumbs from './AppBreadcrumbs.vue'
import CartCounter from './CartCounter.vue'
</script>

<template>
  <header>
    <RouterLink to="/">Mobile Store</RouterLink>
    <AppBreadcrumbs />
    <CartCounter class="cart-counter" />
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4)
    max(var(--space-4), calc((100% - var(--content-width)) / 2 + var(--space-4)));
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

header > a:first-child {
  color: var(--color-text);
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.01em;
}

header > a:first-child:hover {
  color: var(--color-accent);
  text-decoration: none;
}

.cart-counter {
  margin-left: auto;
}
</style>
