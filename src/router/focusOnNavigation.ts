import { nextTick } from 'vue'
import { START_LOCATION, type RouteLocationNormalizedLoaded } from 'vue-router'

export async function focusMainAfterNavigation(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
) {
  // Ni la primera carga ni la búsqueda (que solo cambia la query) deben mover el foco.
  if (from === START_LOCATION || to.path === from.path) return

  await nextTick()
  document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true })
}
