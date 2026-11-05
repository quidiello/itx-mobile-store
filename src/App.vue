<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, START_LOCATION, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { pageTitle } from './composables/usePageTitle'

const announcement = ref('')
let navigated = false

useRouter().afterEach((_to, from) => {
  if (from !== START_LOCATION) navigated = true
})

watch(pageTitle, (title) => {
  if (navigated) announcement.value = title
})
</script>

<template>
  <AppHeader />
  <RouterView />
  <p class="sr-only" role="status">{{ announcement }}</p>
</template>
