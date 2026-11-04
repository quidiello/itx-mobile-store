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
      width="24"
      height="24"
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
    <span aria-hidden="true">{{ cart.count }}</span>
    <span class="sr-only">{{ description }}</span>
  </div>
</template>

<style scoped>
.cart {
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
