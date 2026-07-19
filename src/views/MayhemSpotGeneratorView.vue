<script>
const TEAM_COLORS = [
  '#2E7D32',
  '#1565C0',
  '#E65100',
  '#C62828',
  '#00695C',
  '#F9A825'
]

const TEAM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** All sets of n non-overlapping adjacent pairs from spots 1–12. */
function enumerateConfigs(n, minStart = 1) {
  if (n === 0) return [[]]
  const results = []
  for (let s = minStart; s <= 11; s++) {
    const sub = enumerateConfigs(n - 1, s + 2)
    for (const rest of sub) {
      results.push([[s, s + 1], ...rest])
    }
  }
  return results
}

const configCache = {}

function assignSpots(n) {
  if (!configCache[n]) {
    configCache[n] = enumerateConfigs(n)
  }
  const configs = configCache[n]
  if (!configs.length) return null
  const config = configs[Math.floor(Math.random() * configs.length)]
  return shuffle([...config])
}

export default {
  name: 'MayhemSpotGeneratorView',
  data() {
    return {
      numTeams: 5,
      teamOptions: [3, 4, 5, 6],
      assignment: null,
      hasGenerated: false
    }
  },
  computed: {
    spotOwners() {
      const map = {}
      if (!this.assignment) return map
      this.assignment.forEach(([s1, s2], i) => {
        map[s1] = i
        map[s2] = i
      })
      return map
    },
    unusedSpots() {
      if (!this.assignment) return []
      const used = new Set()
      this.assignment.forEach(([s1, s2]) => {
        used.add(s1)
        used.add(s2)
      })
      return Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => !used.has(n))
    }
  },
  methods: {
    setTeams(n) {
      this.numTeams = n
    },
    teamColor(i) {
      return TEAM_COLORS[i]
    },
    teamLetter(i) {
      return TEAM_LETTERS[i]
    },
    generate() {
      const assignment = assignSpots(this.numTeams)
      this.assignment = assignment
      this.hasGenerated = true
    },
    spotStyle(n) {
      const owner = this.spotOwners[n]
      if (owner === undefined) return {}
      const color = TEAM_COLORS[owner]
      return {
        background: color,
        borderColor: 'transparent',
        color: '#fff'
      }
    }
  }
}
</script>

<template>
  <div class="spot-gen">
    <div class="spot-gen__hero">
      <div class="container spot-gen__inner">
        <p class="spot-gen__eyebrow">
          <router-link to="/instrukcja/mayhem">Mayhem</router-link>
          · narzędzie organizatora
        </p>
        <h1 class="spot-gen__title">Generator miejsc startowych</h1>
        <p class="spot-gen__lead">
          Losuje każdej drużynie dwa sąsiadujące numery miejsc (1–12) — do zawieszania kart ołtarzy startowych.
          Rozkład jest równomierny: każda poprawna konfiguracja jest równie prawdopodobna.
        </p>

        <div class="spot-gen__panel card">
          <div class="card-content">
            <div class="spot-gen__controls">
              <div class="spot-gen__teams">
                <span class="spot-gen__label">Liczba drużyn</span>
                <div class="spot-gen__team-btns" role="group" aria-label="Liczba drużyn">
                  <button v-for="n in teamOptions" :key="n" type="button" class="spot-gen__team-btn"
                    :class="{ 'spot-gen__team-btn--active': numTeams === n }" @click="setTeams(n)">
                    {{ n }}
                  </button>
                </div>
              </div>
              <button type="button" class="btn green waves-effect waves-light spot-gen__go" @click="generate">
                Losuj
              </button>
            </div>

            <div class="spot-gen__grid-wrap">
              <div class="spot-gen__grid-label">Miejsca 1–12</div>
              <div class="spot-gen__grid" aria-hidden="true">
                <div v-for="n in 12" :key="n" class="spot-gen__spot"
                  :class="{ 'spot-gen__spot--assigned': spotOwners[n] !== undefined }" :style="spotStyle(n)">
                  <span class="spot-gen__spot-num">{{ n }}</span>
                  <span v-if="spotOwners[n] !== undefined" class="spot-gen__spot-team">
                    {{ teamLetter(spotOwners[n]) }}
                  </span>
                </div>
              </div>
            </div>

            <p v-if="!hasGenerated" class="spot-gen__hint">
              Wybierz liczbę drużyn i naciśnij Losuj.
            </p>

            <div v-else-if="assignment" class="spot-gen__results">
              <div v-for="(pair, i) in assignment" :key="teamLetter(i)" class="spot-gen__card"
                :style="{ borderColor: teamColor(i) }">
                <div class="spot-gen__card-name" :style="{ color: teamColor(i) }">
                  Drużyna {{ teamLetter(i) }}
                </div>
                <div class="spot-gen__pills">
                  <span class="spot-gen__pill" :style="{ background: teamColor(i) }">{{ pair[0] }}</span>
                  <span class="spot-gen__amp">&amp;</span>
                  <span class="spot-gen__pill" :style="{ background: teamColor(i) }">{{ pair[1] }}</span>
                </div>
              </div>
            </div>

            <p v-if="hasGenerated && unusedSpots.length" class="spot-gen__unused" style="margin-top: 1.5rem;">
              Nieużywane miejsca (bez kart startowych):
              <strong>{{ unusedSpots.join(', ') }}</strong>
            </p>
          </div>
        </div>

        <p class="spot-gen__back">
          <router-link to="/instrukcja/mayhem">← Do instrukcji Mayhem</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.spot-gen {
  background: #eceff1;
  min-height: 100dvh;
}

.spot-gen__hero {
  padding: 1.25rem 0 2.5rem;
}

.spot-gen__inner {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.spot-gen__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  color: #607d8b;
  line-height: 1.4;

  a {
    color: #2e7d32;
    font-weight: 600;
  }
}

.spot-gen__title {
  margin: 0 0 0.4rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #263238;
  line-height: 1.2;
}

.spot-gen__lead {
  margin: 0 auto 1.25rem;
  max-width: 36rem;
  color: #455a64;
  line-height: 1.45;
}

.spot-gen__panel {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4caf50;
  text-align: left;
}

.spot-gen__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.spot-gen__teams {
  text-align: center;
}

.spot-gen__label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #546e7a;
  margin-bottom: 0.4rem;
}

.spot-gen__team-btns {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.spot-gen__team-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid #cfd8dc;
  background: #fff;
  color: #546e7a;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.spot-gen__team-btn:hover {
  border-color: #4caf50;
  color: #263238;
}

.spot-gen__team-btn--active {
  background: #4caf50;
  border-color: #4caf50;
  color: #fff;
}

.spot-gen__go.btn {
  margin: 0;
  height: 44px;
  line-height: 42px;
  padding: 0 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: none;
}

.spot-gen__grid-wrap {
  margin-bottom: 1.25rem;
}

.spot-gen__grid-label {
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #90a4ae;
  margin-bottom: 0.65rem;
}

.spot-gen__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.45rem;
  max-width: 360px;
  margin: 0 auto;
}

.spot-gen__spot {
  aspect-ratio: 1;
  border-radius: 10px;
  background: #f5f7f8;
  border: 2px solid #cfd8dc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #90a4ae;
  font-weight: 700;
  transition: transform 0.25s ease, border-color 0.25s ease;
  position: relative;
}

.spot-gen__spot--assigned {
  transform: scale(1.04);
  color: #fff;
}

.spot-gen__spot-num {
  font-size: 1.05rem;
  line-height: 1;
}

.spot-gen__spot-team {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.95;
  margin-top: 3px;
}

.spot-gen__hint {
  margin: 0;
  text-align: center;
  color: #78909c;
  font-size: 0.95rem;
}

.spot-gen__results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.spot-gen__card {
  background: #fafafa;
  border: 1.5px solid #cfd8dc;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.spot-gen__card-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.spot-gen__pills {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.spot-gen__pill {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.spot-gen__amp {
  color: #90a4ae;
  font-weight: 300;
}

.spot-gen__unused {
  margin: 1.5rem 0 0;
  font-size: 0.9rem;
  color: #546e7a;
  line-height: 1.4;
  text-align: center;
}

.spot-gen__back {
  margin: 1.25rem 0 0;
  font-size: 0.95rem;
  text-align: center;

  a {
    color: #2e7d32;
    font-weight: 600;
  }
}

@media (max-width: 480px) {
  .spot-gen__grid {
    max-width: 100%;
  }
}
</style>
