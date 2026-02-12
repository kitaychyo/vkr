<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import MatchCard from '@/components/MatchCard.vue'
import Loader from '@/components/Loader.vue'

const matches = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const sortBy = ref('newest')
const API_BASE = 'http://127.0.0.1:8000/api'

async function fetchHistory() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`${API_BASE}/matches-history`)
    matches.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    error.value = 'Ошибка при загрузке истории'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const filteredMatches = computed(() => {
  let result = [...matches.value]

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    result = result.filter(m =>
      m.RadiantTeamName.toLowerCase().includes(term) ||
      m.DireTeamName.toLowerCase().includes(term) ||
      String(m.match_id).includes(term)
    )
  }

  // Sort
  if (sortBy.value === 'newest') {
    result.sort((a, b) => Number(b.match_id) - Number(a.match_id))
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => Number(a.match_id) - Number(b.match_id))
  } else if (sortBy.value === 'duration_asc') {
    result.sort((a, b) => (a.duration || 0) - (b.duration || 0))
  } else if (sortBy.value === 'duration_desc') {
    result.sort((a, b) => (b.duration || 0) - (a.duration || 0))
  }

  return result
})

onMounted(fetchHistory)
</script>

<template>
  <div>
    <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search teams or match ID..."
        style="flex: 1; min-width: 200px;"
      />
      <select v-model="sortBy">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="duration_asc">Shortest Match</option>
        <option value="duration_desc">Longest Match</option>
      </select>
      <button @click="fetchHistory">🔄 Refresh</button>
    </div>

    <Loader v-if="loading" />

    <div v-if="error" style="color: #ff6b6b; padding: 16px; background: rgba(255, 107, 107, 0.1); border-radius: 8px; margin-bottom: 16px;">
      {{ error }}
    </div>

    <div v-if="!loading && filteredMatches.length === 0" style="text-align: center; color: var(--text-muted); padding: 48px 16px;">
      <p v-if="searchTerm">No matches found matching "{{ searchTerm }}"</p>
      <p v-else>No matches in history</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
      <MatchCard v-for="m in filteredMatches" :key="m.match_id" :match="m" />
    </div>

    <div v-if="!loading && filteredMatches.length > 0" style="text-align: center; color: var(--text-muted); padding: 16px; margin-top: 16px;">
      Showing {{ filteredMatches.length }} of {{ matches.length }} matches
    </div>
  </div>
</template>

<style scoped>
</style>
