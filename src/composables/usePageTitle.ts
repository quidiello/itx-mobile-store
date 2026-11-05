import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

const APP_NAME = 'Mobile Store'

export const pageTitle = ref(APP_NAME)

export function usePageTitle(title: MaybeRefOrGetter<string | undefined>) {
  watchEffect(() => {
    const value = toValue(title)
    if (!value) return

    const fullTitle = `${value} · ${APP_NAME}`
    pageTitle.value = fullTitle
    document.title = fullTitle
  })
}
