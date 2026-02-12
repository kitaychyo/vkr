<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isLive = ref(true)

function toggle(val) {
  isLive.value = val
  router.push(val ? '/' : '/history')
}
</script>

<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">
          <h1>⚡ Dota2 Live</h1>
        </router-link>
        <div class="nav-links">
          <button @click="toggle(true)" :style="{ opacity: isLive ? 1 : 0.5 }">Live</button>
          <button @click="toggle(false)" :style="{ opacity: !isLive ? 1 : 0.5 }">History</button>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-bottom: 1px solid var(--border);
  padding: 16px 20px;
  backdrop-filter: blur(10px);
}

header nav {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 24px;
}

h1 a {
  color: inherit;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 12px;
}

main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

@media (max-width: 768px) {
  header nav {
    flex-direction: column;
    gap: 12px;
  }

  h1 {
    font-size: 18px;
  }

  main {
    padding: 12px;
  }
}
</style>