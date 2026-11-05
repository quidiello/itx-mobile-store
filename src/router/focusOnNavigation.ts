import { nextTick } from 'vue'
import { START_LOCATION, type RouteLocationNormalizedLoaded } from 'vue-router'

export async function focusMainAfterNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
) {
  // Neither the first load nor the search (which only changes the query) should move the focus.
  if (from === START_LOCATION || to.path === from.path) return

  await nextTick()
  document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
}
