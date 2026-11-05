<script setup lang="ts">
import { computed } from 'vue'
import CloudOffIcon from './icons/CloudOffIcon.vue'
import PackageIcon from './icons/PackageIcon.vue'
import SearchIcon from './icons/SearchIcon.vue'

const props = defineProps<{
  icon: 'error' | 'search' | 'empty'
  title: string
  description?: string
}>()

const icons = { error: CloudOffIcon, search: SearchIcon, empty: PackageIcon }

const role = computed(() => (props.icon === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div class="state" :class="{ error: icon === 'error' }" :role="role">
    <span class="icon" aria-hidden="true"><component :is="icons[icon]" /></span>
    <p class="title">{{ title }}</p>
    <p v-if="description" class="description">{{ description }}</p>
    <div v-if="$slots.default" class="action"><slot /></div>
  </div>
</template>

<style scoped>
.state {
  max-width: 24rem;
  margin: var(--space-8) auto;
  padding: var(--space-7) var(--space-5);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  text-align: center;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.error .icon {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.3;
}

.description {
  margin: 0 0 var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.action {
  display: flex;
  justify-content: center;
}

.action :slotted(button) {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-pill);
}

.action :slotted(button.secondary) {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.action :slotted(button.secondary:hover:not(:disabled)) {
  background: color-mix(in srgb, var(--color-accent) 18%, white);
  color: var(--color-accent-hover);
}
</style>
