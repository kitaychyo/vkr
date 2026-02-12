<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({ match: Object })
const router = useRouter()

function getTeamLogoUrl(id) {
  if (!id || id === '0' || id === 0) return '/favicon.ico'
  const str = String(id)
  if (str.startsWith('http')) return str
  return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/teams/${str}/logo.png`
}

function openDetail() {
  router.push({ name: 'match', params: { id: props.match.match_id } })
}

const durationStr = computed(() => {
  const mins = Math.floor((props.match.duration || 0) / 60)
  const secs = (props.match.duration || 0) % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
})

const predictStr = computed(() => {
  const v = props.match.PredictRadiant
  if (v === null || v === undefined) return '—'
  const n = typeof v === 'string' ? parseFloat(v) : Number(v)
  if (Number.isNaN(n)) return '—'
  return (n * 100).toFixed(1) + '%'
})
</script>

<template>
  <div class="match-card" @click="openDetail">
    <div class="card-content">
      <div class="teams">
        <div class="team">
          <img :src="getTeamLogoUrl(match.RadiantLogoTeamId)" class="team-logo" />
          <div class="team-info">
            <div class="team-name">{{ match.RadiantTeamName }}</div>
            <div class="team-side">Radiant</div>
          </div>
        </div>
        <div class="vs">vs</div>
        <div class="team">
          <img :src="getTeamLogoUrl(match.DireLogoTeamId)" class="team-logo" />
          <div class="team-info">
            <div class="team-name">{{ match.DireTeamName }}</div>
            <div class="team-side">Dire</div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="stat-mini">
          <span class="label">Duration</span>
          <span class="value">{{ durationStr }}</span>
        </div>
        <div class="stat-mini">
          <span class="label">Radiant</span>
          <span class="value predict">{{ predictStr }}</span>
        </div>
        <div class="stat-mini">
          <span class="label">Match #</span>
          <span class="value">{{ match.match_id }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.05) 0%, transparent 100%);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.match-card:hover {
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.1) 0%, rgba(66, 184, 131, 0.02) 100%);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(66, 184, 131, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.teams {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.team-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: contain;
  background: var(--glass-light);
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.team-info {
  min-width: 0;
  flex: 1;
}

.team-name {
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-side {
  font-size: 10px;
  color: var(--text-muted);
}

.vs {
  margin: 0 4px;
  color: var(--text-muted);
  font-size: 10px;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.stat-mini {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  text-align: center;
}

.label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.value.predict {
  color: var(--accent);
}
</style>
