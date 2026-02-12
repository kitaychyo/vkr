<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import axios from 'axios'
import Loader from './Loader.vue'
import Skeleton from './Skeleton.vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, Filler)

const matches = ref([])
const selectedMatch = ref(null)
const chartCanvas = ref(null)
const loading = ref(false)
const error = ref(null)
let chartInstance = null

const API_BASE = 'http://127.0.0.1:8000/api'

function getTeamLogoUrl(id) {
  if (!id || id === '0' || id === 0) return '/favicon.ico'
  const str = String(id)
  if (str.startsWith('http')) return str
  return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/teams/${str}/logo.png`
}

async function fetchLiveMatches() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`${API_BASE}/live-matches`)
    matches.value = Array.isArray(res.data) ? res.data : []
    if (matches.value.length > 0 && !selectedMatch.value) {
      selectedMatch.value = matches.value[0]
    }
  } catch (e) {
    error.value = 'Ошибка при загрузке матчей'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchMatchSnapshot(match) {
  if (!match) return
  try {
    let res = await axios.get(`${API_BASE}/live-matches/${match.match_id}`)
    let snapshots = Array.isArray(res.data) ? res.data : []
    
    if (!snapshots.length) {
      res = await axios.get(`${API_BASE}/matches-history/${match.match_id}`)
      snapshots = Array.isArray(res.data) ? res.data : []
    }
    
    renderChart(snapshots)
  } catch (e) {
    console.error(e)
  }
}

function renderChart(snapshots) {
  nextTick(() => {
    if (!chartCanvas.value) return
    const ctx = chartCanvas.value.getContext('2d')
    if (chartInstance) chartInstance.destroy()
    
    const labels = snapshots.map(s => Math.round((s.duration || 0) / 60))
    const values = snapshots.map(s => {
      const v = s.predict_radiant ?? s.predict_radiant ?? 0
      return typeof v === 'string' ? parseFloat(v) : v
    })
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predict Radiant Win %',
            data: values,
            borderColor: '#42b883',
            backgroundColor: 'rgba(66, 184, 131, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#42b883',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, labels: { color: 'var(--text-muted)', font: { size: 12 } } }
        },
        scales: {
          y: {
            min: 0,
            max: 1,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'var(--text-muted)', callback: (v) => (v * 100).toFixed(0) + '%' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'var(--text-muted)', callback: (v) => v + ' min' }
          }
        }
      }
    })
  })
}

const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    const da = Number(a.duration || 0)
    const db = Number(b.duration || 0)
    return da - db
  })
})

function formatPredict(v) {
  if (v === null || v === undefined) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  if (Number.isNaN(n)) return '—'
  return (n * 100).toFixed(1) + '%'
}

onMounted(async () => {
  await fetchLiveMatches()
  const interval = setInterval(fetchLiveMatches, 10000)
  return () => clearInterval(interval)
})

watch(selectedMatch, (m) => {
  if (m) fetchMatchSnapshot(m)
})
</script>

<template>
  <div class="layout dual">
    <aside class="sidebar">
      <h2>🎮 Live Matches {{ sortedMatches.length }}</h2>
      
      <Loader v-if="loading" />
      
      <div v-if="error" style="color: #ff6b6b; font-size: 12px; padding: 12px;">
        {{ error }}
      </div>

      <div v-if="!loading && sortedMatches.length === 0" class="empty">
        Нет активных матчей
      </div>

      <div v-if="!loading">
        <div
          v-for="m in sortedMatches"
          :key="m.match_id"
          class="match-card"
          :style="{ borderColor: selectedMatch?.match_id === m.match_id ? 'var(--accent)' : undefined }"
          @click="selectedMatch = m"
        >
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <div class="team">
              <img :src="getTeamLogoUrl(m.RadiantLogoTeamId)" class="team-logo" />
              <div class="team-name">{{ m.RadiantTeamName }}</div>
            </div>
            <div style="color: var(--text-muted); font-size: 11px;">—</div>
            <div class="team">
              <img :src="getTeamLogoUrl(m.DireLogoTeamId)" class="team-logo" />
              <div class="team-name">{{ m.DireTeamName }}</div>
            </div>
          </div>
          <div class="match-meta">
            <div>#{{ m.match_id }}</div>
            <div>{{ Math.round((m.duration || 0) / 60) }}m</div>
            <div class="predict">{{ formatPredict(m.PredictRadiant) }}</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="detail">
      <div class="header" v-if="selectedMatch">
        <div>
          <h2 class="title">{{ selectedMatch.RadiantTeamName }} vs {{ selectedMatch.DireTeamName }}</h2>
          <p class="sub">
            Match #{{ selectedMatch.match_id }} • 
            {{ Math.round((selectedMatch.duration || 0) / 60) }} min up 🔴
          </p>
        </div>
      </div>

      <div v-else style="text-align: center; color: var(--text-muted); padding: 32px;">
        Выберите матч слева
      </div>

      <section v-if="selectedMatch">
        <h4 style="margin: 0 0 16px 0;">🎯 Prediction Chart</h4>
        <div class="chart-container" style="height: 320px;">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </section>

      <section v-if="selectedMatch">
        <h4>📊 Match Stats</h4>
        <div class="grid">
          <div class="stat">
            <div style="color: var(--text-muted); font-size: 11px;">Duration</div>
            <strong>{{ Math.round((selectedMatch.duration || 0) / 60) }}:{{ String((selectedMatch.duration || 0) % 60).padStart(2, '0') }}</strong>
          </div>
          <div class="stat">
            <div style="color: var(--text-muted); font-size: 11px;">Radiant Win</div>
            <strong class="predict">{{ formatPredict(selectedMatch.PredictRadiant) }}</strong>
          </div>
          <div class="stat">
            <div style="color: var(--text-muted); font-size: 11px;">Dire Win</div>
            <strong class="predict">{{ formatPredict(1 - (typeof selectedMatch.PredictRadiant === 'string' ? parseFloat(selectedMatch.PredictRadiant) : selectedMatch.PredictRadiant || 0)) }}</strong>
          </div>
          <div class="stat">
            <div style="color: var(--text-muted); font-size: 11px;">Match ID</div>
            <strong>#{{ selectedMatch.match_id }}</strong>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout.dual {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
}

.sidebar {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.sidebar h2 {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
}

.detail {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  min-height: 600px;
}

.detail .header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 4px 0 0 0;
}

section h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

@media (max-width: 900px) {
  .layout.dual {
    grid-template-columns: 1fr;
  }

  .sidebar {
    max-height: 400px;
  }

  .detail {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .layout.dual {
    gap: 12px;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    max-height: none;
  }
}
</style>
