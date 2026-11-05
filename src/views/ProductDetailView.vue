<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ArrowLeftIcon from '@/components/icons/ui/ArrowLeftIcon.vue'
import PageToolbar from '@/components/PageToolbar.vue'
import ProductActions from '@/components/ProductActions.vue'
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton.vue'
import ProductDescription from '@/components/ProductDescription.vue'
import ProductImage from '@/components/ProductImage.vue'
import StateMessage from '@/components/StateMessage.vue'
import { usePageTitle } from '@/composables/usePageTitle'
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

usePageTitle(() => {
  if (loading.value) return undefined
  return product.value ? name.value : "Couldn't load the product"
})
</script>

<template>
  <main tabindex="-1">
    <PageToolbar>
      <template #leading>
        <RouterLink v-slot="{ href }" to="/" custom>
          <a
            :href="href"
            class="back"
            aria-label="Back to the product list"
            @click.prevent="goBack"
          >
            <ArrowLeftIcon :size="18" />
          </a>
        </RouterLink>
      </template>
    </PageToolbar>

    <div v-if="loading" aria-busy="true">
      <p class="sr-only" role="status">Loading product</p>
      <ProductDetailSkeleton aria-hidden="true" />
    </div>
    <StateMessage
      v-else-if="error || !product"
      icon="error"
      title="Couldn't load the product"
      description="Something went wrong while contacting the server. Check your connection and try again."
    >
      <button type="button" @click="reload">Try again</button>
      <RouterLink v-slot="{ href }" to="/" custom>
        <a :href="href" class="secondary" @click.prevent="goBack">Back to the list</a>
      </RouterLink>
    </StateMessage>
    <template v-else>
      <div class="layout">
        <ProductImage class="sticky" :src="product.imgUrl" :alt="name" />
        <div class="details">
          <section class="card">
            <ProductDescription :product="product" />
          </section>
          <section class="card actions">
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
  main {
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom));
  }

  .actions {
    margin-top: calc(var(--space-4) * -1);
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
