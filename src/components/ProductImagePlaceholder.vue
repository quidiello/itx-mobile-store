<template>
  <div class="placeholder">
    <div class="tile">
      <svg viewBox="0 0 72 160" fill="none" aria-hidden="true" focusable="false">
        <rect width="72" height="160" rx="16" fill="#c9d3f0" />
        <rect x="6" y="6" width="60" height="148" rx="11" fill="#f6f8fe" />
        <rect x="24" y="12" width="24" height="4" rx="2" fill="#c9d3f0" />
        <circle cx="36" cy="142" r="5.5" fill="#c9d3f0" />
        <circle cx="24" cy="56" r="8" fill="#dde4fa" />
        <path d="M12 92l14-16 10 10 8-8 14 14v8a7 7 0 0 1-7 7H19a7 7 0 0 1-7-7z" fill="#dde4fa" />
        <rect x="16" y="114" width="40" height="5" rx="2.5" fill="#e7ecfb" />
        <rect x="16" y="124" width="28" height="5" rx="2.5" fill="#e7ecfb" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  position: absolute;
  inset: var(--inset, 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 3 / 4;
  height: 100%;
  max-width: 100%;
  padding: 9%;
  border-radius: var(--radius-xl);
  background: var(--color-accent-soft);
}

svg {
  display: block;
  width: auto;
  max-width: 100%;
  height: 100%;
}
</style>
