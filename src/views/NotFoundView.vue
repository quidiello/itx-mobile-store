<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { usePageTitle } from '@/composables/usePageTitle'

usePageTitle('Page not found')
</script>

<template>
  <main tabindex="-1">
    <h1>Page not found</h1>
    <RouterLink to="/">Back to the product list</RouterLink>
  </main>
</template>
