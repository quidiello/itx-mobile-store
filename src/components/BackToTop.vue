<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SHOW_AFTER_PX = 200

const visible = ref(false)

function update() {
  visible.value = window.scrollY > SHOW_AFTER_PX
}

function scrollToTop() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>

<template>
  <Transition name="fade">
    <button v-if="visible" type="button" class="top" aria-label="Back to top" @click="scrollToTop">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.top {
  position: fixed;
  right: var(--space-5);
  bottom: max(var(--space-5), env(safe-area-inset-bottom));
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  color: var(--color-text);
  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.top:hover:not(:disabled) {
  background: var(--color-surface);
  color: var(--color-accent);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
