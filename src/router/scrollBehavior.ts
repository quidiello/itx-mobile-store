import type { RouterScrollBehavior } from 'vue-router'

export const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  // When going back, wait a moment so the list has already been painted.
  if (savedPosition) {
    return new Promise((resolve) => setTimeout(() => resolve(savedPosition), 0))
  }
  // Typing in the search only changes the query and must not move the page.
  if (to.path === from.path) return false
  return { top: 0 }
}
