import type { RouterScrollBehavior } from 'vue-router'

export const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  // Al volver atrás se espera un instante para que el listado ya esté pintado.
  if (savedPosition) {
    return new Promise((resolve) => setTimeout(() => resolve(savedPosition), 0))
  }
  // Teclear en el buscador solo cambia la query y no debe mover la página.
  if (to.path === from.path) return false
  return { top: 0 }
}
