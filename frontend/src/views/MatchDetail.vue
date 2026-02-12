<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend)

const props = defineProps({ id: [String, Number] })
const matchId = props.id || null
const snapshots = ref([])
const matchMeta = ref(null)
const chartCanvas = ref(null)
let chartInstance = null
const API_BASE = 'http://127.0.0.1:8000/api'

function getTeamLogoUrl(id) {
  if (!id || id === '0' || id === 0) return '/favicon.ico'
  const str = String(id)
  if (str.startsWith('http')) return str
  return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/teams/${str}/logo.png`
}

async function fetchMeta() {
  try {
    const res = await axios.get(`${API_BASE}/live-matches`)
    const list = Array.isArray(res.data) ? res.data : []
    matchMeta.value = list.find(m => String(m.match_id) === String(matchId)) || null
  } catch (e) {
    console.error(e)
  }
}

async function fetchSnapshots() {
  try {
    let res = await axios.get(`${API_BASE}/live-matches/${matchId}`)
    let data = Array.isArray(res.data) ? res.data : []
    if (!data.length) {
      res = await axios.get(`${API_BASE}/matches-history/${matchId}`)
      data = Array.isArray(res.data) ? res.data : []
    }
    snapshots.value = data
    renderChart()
  } catch (e) {
    console.error(e)
  }
}

function renderChart() {
  nextTick(() => {
    if (!chartCanvas.value) return
    const ctx = chartCanvas.value.getContext('2d')
    if (chartInstance) chartInstance.destroy()
    const labels = snapshots.value.map(s => Math.round((s.duration || s.duration || 0) / 60))
    const values = snapshots.value.map(s => s.predict_radiant ?? s.predict_radiant ?? s.predict_radiant)
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Predict Radiant', data: values, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', tension:0.25 }] },
      options: { responsive:true, scales: { y: { min:0, max:1 } } }
    })
  })
}

onMounted(async () => {
  await fetchMeta()
  await fetchSnapshots()
})
</script>

<template>
  <div class="detail">
    <div class="header">
      <div class="teams">
        <div class="team">
          <img :src="getTeamLogoUrl(matchMeta?.RadiantLogoTeamId)" class="team-logo" />
          <div class="team-name">{{ matchMeta?.RadiantTeamName || 'Radiant' }}</div>
        </div>
        <div class="vs">vs</div>
        <div class="team">
          <img :src="getTeamLogoUrl(matchMeta?.DireLogoTeamId)" class="team-logo" />
          <div class="team-name">{{ matchMeta?.DireTeamName || 'Dire' }}</div>
        </div>
      </div>
      <div class="meta">Match #{{ matchId }}</div>
    </div>

    <div class="content">
      <div class="left">
        <canvas ref="chartCanvas" style="max-width:720px;height:360px"></canvas>
      </div>
      <div class="right">
        <h4>Snapshots: {{ snapshots.length }}</h4>
        <ul>
          <li v-for="s in snapshots" :key="s.id">{{ Math.round((s.duration||0)/60) }} min — {{ s.predict_radiant ?? s.predict_radiant ?? '—' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail { padding:16px }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.teams { display:flex; align-items:center; gap:12px }
.team { display:flex; align-items:center; gap:8px }
.team-logo { width:56px; height:56px; object-fit:contain }
.vs { color:#888 }
.content { display:flex; gap:16px }
.left { flex:1 }
.right { width:260px; border-left:1px solid #eee; padding-left:12px }
</style>
