<script setup lang="ts">
import IconBase from './IconBase.vue'

withDefaults(defineProps<{ direction?: 'down' | 'up' | 'right' }>(), { direction: 'down' })
</script>

<template>
  <IconBase class="chevron" :class="direction"><path d="m6 9 6 6 6-6" /></IconBase>
</template>

<style scoped>
.chevron {
  transition: transform 0.2s ease;
}

.up {
  transform: rotate(180deg);
}

.right {
  transform: rotate(-90deg);
}
</style>
