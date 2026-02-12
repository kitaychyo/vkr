<script setup></script>

<template>
  <div class="skeleton">
    <div class="skeleton-line short"></div>
    <div style="display: flex; gap: 12px; margin-top: 8px;">
      <div class="skeleton-logo"></div>
      <div style="flex: 1;">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short" style="margin-top: 6px;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  padding: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 8px;
}

.skeleton-line {
  height: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 4px;
}

.skeleton-line.short { width: 60%; }
.skeleton-logo { width: 40px; height: 40px; background: rgba(255,255,255,0.03); border-radius: 6px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
