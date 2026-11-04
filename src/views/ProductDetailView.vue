<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppSkeleton from '@/components/AppSkeleton.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import ProductActions from '@/components/ProductActions.vue'
import ProductDescription from '@/components/ProductDescription.vue'
import ProductImage from '@/components/ProductImage.vue'
import { useProduct } from '@/composables/useProduct'

const route = useRoute()
const router = useRouter()
const { product, loading, error, reload } = useProduct(() => String(route.params.id))

// Going back through the history restores the scroll and the search of the list;
// a direct visit has no previous page, so it falls back to the list itself.
function goBack() {
  if (router.options.history.state.back) router.back()
  else router.push('/')
}

const name = computed(
  () => [product.value?.brand, product.value?.model].filter(Boolean).join(' ') || 'Product',
)
</script>

<template>
  <main>
    <PageToolbar>
      <template #leading>
        <RouterLink v-slot="{ href }" to="/" custom>
          <a
            :href="href"
            class="back"
            aria-label="Back to the product list"
            @click.prevent="goBack"
          >
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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </a>
        </RouterLink>
      </template>
    </PageToolbar>

    <div v-if="loading" class="layout">
      <AppSkeleton height="20rem" />
      <div class="details">
        <AppSkeleton height="12rem" />
        <AppSkeleton height="9rem" />
      </div>
    </div>
    <div v-else-if="error || !product" role="alert">
      <p>Product could not be loaded</p>
      <button type="button" @click="reload">Retry</button>
    </div>
    <template v-else>
      <div class="layout">
        <ProductImage class="sticky" :src="product.imgUrl" :alt="name" />
        <div class="details">
          <section class="card">
            <ProductDescription :product="product" />
          </section>
          <section class="card">
            <ProductActions :product="product" />
          </section>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.back {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
  transition: color 0.2s ease;
}

.back:hover {
  color: var(--color-accent);
  text-decoration: none;
}

.layout .skeleton {
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
}

.layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
  align-items: start;
}

.details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card {
  padding: var(--space-5);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

@media (min-width: 40rem) {
  .sticky {
    position: sticky;
    top: var(--space-5);
  }
}

@media (max-width: 40rem) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
