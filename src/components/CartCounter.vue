<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

const description = computed(() => `Cart, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}`)
</script>

<template>
  <div class="cart" role="status">
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M2 3h3l2.5 12h11l2-8H6" />
    </svg>
    <span class="label" aria-hidden="true">Cart</span>
    <span class="count" :class="{ empty: cart.count === 0 }" aria-hidden="true">{{
      cart.count
    }}</span>
    <span class="sr-only">{{ description }}</span>
  </div>
</template>

<style scoped>
.cart {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.25rem;
  padding: 0 var(--space-1) 0 var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 500;
}

.count {
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.75rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.count.empty {
  background: var(--color-border);
  color: var(--color-text-muted);
}

@media (max-width: 30rem) {
  .label {
    display: none;
  }
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
