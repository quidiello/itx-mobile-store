<script setup lang="ts">
import { onBeforeUnmount, onMounted, useId, useTemplateRef } from 'vue'
import CloseIcon from './icons/ui/CloseIcon.vue'
import SearchIcon from './icons/ui/SearchIcon.vue'

const query = defineModel<string>({ required: true })
const inputId = useId()
const input = useTemplateRef('input')

function clear() {
  query.value = ''
  input.value?.focus()
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

function focusOnSlash(event: KeyboardEvent) {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
  if (isTyping(event.target)) return
  event.preventDefault()
  input.value?.focus()
}

onMounted(() => document.addEventListener('keydown', focusOnSlash))
onBeforeUnmount(() => document.removeEventListener('keydown', focusOnSlash))
</script>

<template>
  <div class="search">
    <label :for="inputId" class="sr-only">Search by brand or model</label>
    <SearchIcon class="icon" />
    <input
      :id="inputId"
      ref="input"
      v-model="query"
      type="search"
      placeholder="Search by brand or model"
      aria-keyshortcuts="/"
    />
    <kbd v-if="!query" class="shortcut" aria-hidden="true">/</kbd>
    <button v-if="query" type="button" class="clear" aria-label="Clear search" @click="clear">
      <CloseIcon :size="12" />
    </button>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  max-width: 24rem;
  min-height: 2.25rem;
  padding: 0 var(--space-3) 0 var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-muted);
  transition: box-shadow 0.2s ease;
}

.search:focus-within {
  color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent);
}

.icon {
  flex: none;
}

input {
  flex: 1;
  min-width: 0;
  padding: var(--space-2) 0;
  border: 0;
  background: none;
  color: var(--color-text);
  font: inherit;
  font-size: var(--text-sm);
}

input:focus-visible {
  outline: none;
}

input::placeholder {
  color: var(--color-text-muted);
}

input::-webkit-search-cancel-button {
  appearance: none;
}

.shortcut {
  display: none;
  flex: none;
  min-width: 1.375rem;
  height: 1.375rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.125rem;
  text-align: center;
}

@media (hover: hover) and (pointer: fine) {
  .search:not(:focus-within) .shortcut {
    display: block;
  }
}

.clear {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border-radius: 50%;
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.clear:hover:not(:disabled) {
  background: var(--color-border);
  color: var(--color-text);
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
