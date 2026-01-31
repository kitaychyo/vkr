<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])

async function fetchData() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/live-matches')
    items.value = await response.json()
    console.log(items.value)
  } catch (error) {
    console.error('Бля, ошибка:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <h1>Данные из API:</h1>
    <ul>
      <!-- Отрисовываем список шаблоном v-for -->
      <li v-for="item in items" :key="item.id">
        {{ item.match_id }}
      </li>
    </ul>
  </div>
</template>
