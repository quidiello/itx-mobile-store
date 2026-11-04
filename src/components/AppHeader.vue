<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppBreadcrumbs from './AppBreadcrumbs.vue'
</script>

<template>
  <header>
    <RouterLink to="/">Mobile Store</RouterLink>
    <AppBreadcrumbs />
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
}
</style>
