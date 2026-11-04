<script setup lang="ts">
import { useId } from 'vue'

const query = defineModel<string>({ required: true })
const inputId = useId()
</script>

<template>
  <div>
    <label :for="inputId" class="sr-only">Search by brand or model</label>
    <input :id="inputId" v-model="query" type="search" placeholder="Search by brand or model" />
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
