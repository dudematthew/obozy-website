<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraAccountGate from '@/components/gra/GraAccountGate.vue'
import { getLeaderboard, getMe, renamePlayer } from '@/api/graPlayers'
import {
  getAccounts,
  getActiveAccount,
  getActiveToken,
  removeAccount,
  setActiveToken,
  upsertAccount
} from '@/lib/graAccounts'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'
import intro from '@/data/gra-intro.json'

export default {
  name: 'GraGraczView',
  components: { GraShell, GraAccountGate },
  data() {
    return {
      accounts: [],
      active: null,
      loading: false,
      error: null,
      summary: null,
      /** 1-based place on public board, or null if outside the returned list */
      rankPlace: null,
      rankBoardSize: 0,
      redirect: null,
      gateKey: 0,
      showAccountsModal: false,
      renaming: false,
      renameOpen: false,
      renameDraft: '',
      renameError: null,
      stampUrl,
      atmosphereUrl
    }
  },
  computed: {
    festStyle() {
      return { '--gra-fest-bg': `url(${this.atmosphereUrl})` }
    },
    organizersLine() {
      const list = intro.organizers || []
      return list.length ? list.join(', ') : null
    },
    isWinning() {
      return this.rankPlace != null && this.rankPlace <= 3
    },
    rankLine() {
      if (this.rankPlace == null) {
        if (this.rankBoardSize > 0) {
          return `Poza pierwszą ${this.rankBoardSize} - zbierz punkty, żeby wejść na tablicę.`
        }
        return 'Na tablicy jeszcze nikogo nie ma. Bądź pierwszy.'
      }
      if (this.isWinning) {
        if (this.rankPlace === 1) {
          return 'Miejsce 1 - prowadzisz. Top 3 wygrywa specjalną nagrodę.'
        }
        return `Miejsce ${this.rankPlace} - jesteś w czołówce. Top 3 wygrywa specjalną nagrodę.`
      }
      return `Miejsce ${this.rankPlace}. Do wygranej potrzebujesz top 3.`
    }
  },
  created() {
    this.redirect = this.$route.query.redirect || null
    this.refreshLocal()
    if (getActiveToken()) this.loadSummary()
  },
  methods: {
    refreshLocal() {
      this.accounts = getAccounts()
      this.active = getActiveAccount()
    },
    /**
     * /players/me has score but no place. Rank = index on GET /players/leaderboard
     * (same list as Ranking). Match by player id.
     */
    async loadSummary() {
      this.loading = true
      this.error = null
      try {
        const token = getActiveToken()
        const [summary, board] = await Promise.all([
          getMe(token),
          getLeaderboard().catch(() => ({ players: [] }))
        ])
        this.summary = summary
        const players = (board && board.players) || []
        this.rankBoardSize = players.length
        const myId = summary && summary.player && summary.player.id
        const idx = players.findIndex((p) => p.id === myId)
        this.rankPlace = idx >= 0 ? idx + 1 : null
      } catch (err) {
        this.summary = null
        this.rankPlace = null
        this.rankBoardSize = 0
        this.error = (err && err.message) || 'Nie udało się wczytać wyniku.'
      } finally {
        this.loading = false
      }
    },
    onReady() {
      this.refreshLocal()
      this.gateKey += 1
      this.showAccountsModal = false
      if (typeof this.redirect === 'string' && this.redirect.startsWith('/gra')) {
        this.$router.replace(this.redirect)
        return
      }
      this.redirect = null
      this.loadSummary()
    },
    openAccountsModal() {
      this.refreshLocal()
      this.showAccountsModal = true
    },
    closeAccountsModal() {
      this.showAccountsModal = false
    },
    openRename() {
      this.renameDraft = (this.summary && this.summary.player && this.summary.player.displayName) || ''
      this.renameError = null
      this.renameOpen = true
    },
    cancelRename() {
      this.renameOpen = false
      this.renameError = null
      this.renaming = false
    },
    async saveRename() {
      const name = this.renameDraft.trim()
      if (!name) {
        this.renameError = 'Podaj imię.'
        return
      }
      this.renaming = true
      this.renameError = null
      try {
        const token = getActiveToken()
        const player = await renamePlayer(token, name)
        upsertAccount({
          token: player.token,
          displayName: player.displayName,
          id: player.id
        })
        this.refreshLocal()
        if (this.summary && this.summary.player) {
          this.summary = {
            ...this.summary,
            player: { ...this.summary.player, displayName: player.displayName }
          }
        }
        this.renameOpen = false
      } catch (err) {
        this.renameError = (err && err.message) || 'Nie udało się zmienić imienia.'
      } finally {
        this.renaming = false
      }
    },
    switchTo(token) {
      setActiveToken(token)
      this.refreshLocal()
      this.gateKey += 1
      this.loadSummary()
      this.showAccountsModal = false
    },
    forget(token) {
      if (!window.confirm('Usunąć tego gracza z tego telefonu? Nie kasuje konta na serwerze, tylko lokalną listę.')) return
      removeAccount(token)
      this.refreshLocal()
      this.gateKey += 1
      if (getActiveToken()) this.loadSummary()
      else this.summary = null
    }
  }
}
</script>

<template>
  <GraShell page-title="Twój postęp">
    <div class="gra-fest" :style="festStyle">
      <div class="gra-fest__panel">
        <template v-if="summary && summary.player">
          <header class="gra-fest__hero">
            <img class="gra-fest__seal" :src="stampUrl" alt="">
            <p class="gra-fest__eyebrow">Twój postęp</p>
            <h1 class="gra-fest__name">{{ summary.player.displayName }}</h1>
            <button v-if="!renameOpen" type="button" class="btn-flat gra-fest__rename-toggle" @click="openRename">
              Zmień imię
            </button>
            <div v-else class="gra-fest__rename">
              <label class="gra-fest__rename-label" for="gra-rename">Nowe imię / ksywa</label>
              <input id="gra-rename" v-model="renameDraft" type="text" class="browser-default gra-field" maxlength="64"
                autocomplete="nickname" :disabled="renaming" @keyup.enter="saveRename">
              <p v-if="renameError" class="gra-fest__rename-error">{{ renameError }}</p>
              <div class="gra-fest__rename-actions">
                <button type="button" class="btn green waves-effect" :disabled="renaming" @click="saveRename">
                  Zapisz
                </button>
                <button type="button" class="btn-flat grey-text" :disabled="renaming" @click="cancelRename">
                  Anuluj
                </button>
              </div>
            </div>
          </header>

          <div class="gra-fest__score" :class="{ 'gra-fest__score--win': isWinning }">
            <div class="gra-fest__score-row">
              <div class="gra-fest__score-block">
                <div class="gra-fest__score-label">Punkty</div>
                <div class="gra-fest__score-value">{{ summary.player.score }}</div>
              </div>
              <div class="gra-fest__score-block">
                <div class="gra-fest__score-label">Miejsce</div>
                <div class="gra-fest__score-value">
                  {{ rankPlace != null ? rankPlace : '—' }}
                </div>
              </div>
            </div>
            <p class="gra-fest__rank-line">{{ rankLine }}</p>
          </div>

          <div class="gra-fest__stats">
            <div class="gra-fest__stat">
              <span class="gra-fest__stat-label">Zadania</span>
              <div class="gra-fest__stat-value">{{ summary.stats.assignmentCount }}</div>
            </div>
            <div class="gra-fest__stat">
              <span class="gra-fest__stat-label">W trakcie</span>
              <div class="gra-fest__stat-value">{{ summary.stats.activeCount }}</div>
            </div>
            <div class="gra-fest__stat">
              <span class="gra-fest__stat-label">Ukończone</span>
              <div class="gra-fest__stat-value">{{ summary.stats.completedCount }}</div>
            </div>
          </div>

          <p class="gra-fest__blurb">
            Treści i status zadań zobaczysz z kartki na terenie (zeskanuj QR albo link pod kodem).
            Tutaj widzisz wynik, miejsce i liczbę przyjętych zadań.
          </p>
          <p v-if="organizersLine" class="gra-fest__blurb gra-fest__blurb--tight" style="margin-bottom: 0.5rem">
            Organizatorzy:
            <strong>{{ organizersLine }}</strong>.
          </p>

          <div class="gra-fest__actions">
            <router-link class="btn green waves-effect" :to="{ name: 'gra-gracze' }">
              Ranking graczy
            </router-link>
            <button type="button" class="text-darken-1 btn-flat grey-text" @click="openAccountsModal">
              Inny telefon albo konto
            </button>
          </div>
        </template>

        <template v-else>
          <p v-if="loading" class="gra-fest__muted">Ładowanie…</p>
          <div v-else-if="error" class="gra-fest__alert">{{ error }}</div>

          <template v-else>
            <header class="gra-fest__hero">
              <img class="gra-fest__seal" :src="stampUrl" alt="">
              <p class="gra-fest__eyebrow">Twój postęp</p>
              <h1 class="gra-fest__name">Kim jesteś?</h1>
            </header>
            <p class="gra-fest__blurb">
              Wybierz lub załóż gracza, żeby zbierać punkty. Zadań nie przegląda się z listy
              w aplikacji. Przyjmujesz je z kartki: skan QR albo link pod kodem.
            </p>
            <GraAccountGate :key="gateKey" :hide-local-list="false" @ready="onReady" />
          </template>
        </template>
      </div>

      <div v-if="showAccountsModal" class="gra-modal" role="dialog" aria-modal="true"
        aria-labelledby="gra-accounts-title" @click.self="closeAccountsModal">
        <div class="gra-modal__panel card">
          <div class="card-content">
            <div
              style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem">
              <span id="gra-accounts-title" class="card-title" style="font-size: 1.15rem; margin: 0">Konta na tym
                telefonie</span>
              <button type="button" class="btn-flat" aria-label="Zamknij" @click="closeAccountsModal">
                <i class="material-icons">close</i>
              </button>
            </div>
            <p class="grey-text" style="line-height: 1.55">
              To jest opcja awaryjna: gdy pożyczasz telefon, zmieniasz ksywę albo chcesz
              usunąć lokalną sesję. Nie kasuje konta na serwerze.
            </p>

            <ul v-if="accounts.length" class="collection" style="margin: 0.75rem 0 1rem">
              <li v-for="a in accounts" :key="a.token" class="collection-item"
                style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem">
                <button type="button" class="btn-flat"
                  style="flex: 1; text-align: left; text-transform: none; padding-left: 0" @click="switchTo(a.token)">
                  {{ a.displayName }}
                  <span v-if="active && active.token === a.token" class="chip green white-text"
                    style="margin-left: 0.35rem; height: 22px; line-height: 22px">aktywny</span>
                </button>
                <button type="button" class="btn-flat red-text" @click="forget(a.token)">Usuń</button>
              </li>
            </ul>
            <p v-else class="grey-text">Brak zapisanych kont na tym urządzeniu.</p>

            <GraAccountGate :key="'modal-' + gateKey" compact hide-local-list @ready="onReady" />
          </div>
        </div>
      </div>
    </div>
  </GraShell>
</template>

<style scoped>
.gra-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.gra-modal__panel {
  width: 100%;
  max-width: 520px;
  max-height: min(90vh, 640px);
  overflow: auto;
  margin: 0;
}

@media (min-width: 600px) {
  .gra-modal {
    align-items: center;
  }
}
</style>
