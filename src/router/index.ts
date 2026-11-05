import { createRouter, createWebHistory } from 'vue-router'
import { focusMainAfterNavigation } from './focusOnNavigation'
import { routes } from './routes'
import { scrollBehavior } from './scrollBehavior'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
})

router.afterEach(focusMainAfterNavigation)

export default router
