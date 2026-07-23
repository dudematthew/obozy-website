<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import GraSoftTimer from '@/components/gra/GraSoftTimer.vue'
import GraAccountGate from '@/components/gra/GraAccountGate.vue'
import GraIntroRules from '@/components/gra/GraIntroRules.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import { acceptTask, getTask } from '@/api/graTasks'
import { getMe } from '@/api/graPlayers'
import { getActiveAccount, getActiveToken, getAccounts } from '@/lib/graAccounts'
import { isUsableToken } from '@/lib/graUrls'
import { isTaskBodyRedundant } from '@/lib/graTaskText'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'

export default {
  name: 'GraPlayView',
  components: { GraShell, GraMarkdown, GraSoftTimer, GraAccountGate, GraIntroRules, GraOrganizersNote },
  data() {
    return {
      loading: true,
      accepting: false,
      error: null,
      task: null,
      account: null,
      playerToken: null,
      pendingAccept: false,
      gateKey: 0,
      identityModalOpen: false,
      stampUrl,
      atmosphereUrl
    }
  },
  computed: {
    sheetStyle() {
      return { '--gra-quest-atmosphere': `url(${this.atmosphereUrl})` }
    },
    acceptToken() {
      return this.$route.params.acceptToken
    },
    hasValidAcceptToken() {
      return isUsableToken(this.acceptToken)
    },
    hasToken() {
      return Boolean(this.playerToken)
    },
    preferRegister() {
      return !this.hasToken && getAccounts().length === 0
    },
    questHeadline() {
      const name = this.task && (this.task.title || '').trim()
      return name ? `ZADANIE: ${name}` : 'ZADANIE'
    },
    statusText() {
      const map = {
        accepted: 'Zadanie zaakceptowane. Działaj.',
        completed: 'Ukończone',
        failed: 'Nieudane. Możesz spróbować ponownie.',
        lost: 'Przegrana (versus)'
      }
      const s = this.task && this.task.playerAssignmentStatus
      return s ? map[s] || s : null
    },
    statusTone() {
      const s = this.task && this.task.playerAssignmentStatus
      if (s === 'completed') return 'ok'
      if (s === 'failed' || s === 'lost') return 'bad'
      if (s === 'accepted') return 'active'
      return ''
    },
    /**
     * Trust API canAccept (includes accept window). Do not bypass for logged-out users —
     * that made time-gated tasks look accept-able before the window opened.
     */
    showAccept() {
      return Boolean(this.task && this.task.canAccept === true)
    },
    showTimer() {
      return (
        this.task &&
        this.task.playerAssignmentStatus === 'accepted' &&
        this.task.softMinutes
      )
    },
    timerNote() {
      if (!this.task) return ''
      if (!this.task.timerStartedAt) {
        return this.task.timerStart === 'accept'
          ? 'Czas powinien ruszyć przy przyjęciu, odśwież stronę.'
          : 'Czas ruszy gdy organizator naciśnie "Start zegar".'
      }
      return this.task.timerStart === 'accept'
        ? 'Czas wystartował od przyjęcia zadania.'
        : 'Czas wystartowuje od rozpoczęcia przez organizatora.'
    },
    acceptWindowHint() {
      if (!this.task || this.task.playerAssignmentStatus || this.task.canAccept) return null
      if (this.task.status === 'completed') return null

      const opens = this.formatWarsawClock(this.task.acceptOpensAt)
      const closes = this.formatWarsawClock(this.task.acceptClosesAt)
      const now = Date.now()
      const opensMs = this.parseUtcMs(this.task.acceptOpensAt)
      const closesMs = this.parseUtcMs(this.task.acceptClosesAt)

      if (opensMs != null && now < opensMs) {
        if (opens && closes) return `Przyjmowanie od ${opens} do ${closes}.`
        if (opens) return `Przyjmowanie od ${opens}.`
      }
      if (closesMs != null && now >= closesMs) {
        if (closes) return `Przyjmowanie zakończone (do ${closes}).`
        return 'Przyjmowanie zakończone.'
      }
      return null
    },
    takenHint() {
      if (!this.task || this.task.playerAssignmentStatus) return null
      if (this.task.status === 'completed') return 'Zadanie zamknięte.'
      if (this.acceptWindowHint) return this.acceptWindowHint
      if (!this.task.canAccept) {
        return 'Niedostępne (zajęte, zapełnione lub poza oknem czasowym).'
      }
      return null
    },
    /** API: null = still hidden; string (even empty) = revealed. */
    bodyRevealed() {
      return this.task != null && this.task.bodyMarkdown != null
    },
    /** Skip body block when it only repeats the short summary. */
    showBody() {
      if (!this.bodyRevealed || !this.task) return false
      return !isTaskBodyRedundant(this.task.summary, this.task.bodyMarkdown)
    },
    bodyPendingHint() {
      if (!this.task || this.bodyRevealed) return null
      if (this.task.bodyReveal === 'whenFull') {
        return 'Pełna treść pojawi się gdy zbierze się drużyna.'
      }
      if (this.task.bodyReveal === 'onAccept' || this.task.logicType === 'gated') {
        return 'Pełna treść pojawi się po przyjęciu zadania.'
      }
      if (this.task.logicType === 'coop' || this.task.logicType === 'versus') {
        return 'Pełna treść pojawi się gdy zbierze się drużyna (albo po przyjęciu), zależnie od zadania.'
      }
      return 'Pełna treść jeszcze ukryta.'
    }
  },
  watch: {
    acceptToken: {
      immediate: true,
      handler() {
        this.pendingAccept = false
        this.load()
      }
    }
  },
  methods: {
    parseUtcMs(iso) {
      if (!iso) return null
      const s = String(iso).trim()
      if (!s) return null
      // Stored as "Y-m-d H:i:s" UTC without Z — force UTC parse.
      const normalized = /Z$|[+-]\d{2}:?\d{2}$/.test(s)
        ? s
        : s.replace(' ', 'T') + 'Z'
      const ms = Date.parse(normalized)
      return Number.isFinite(ms) ? ms : null
    },
    formatWarsawClock(iso) {
      const ms = this.parseUtcMs(iso)
      if (ms == null) return null
      try {
        return new Intl.DateTimeFormat('pl-PL', {
          timeZone: 'Europe/Warsaw',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date(ms))
      } catch (e) {
        return null
      }
    },
    syncAuth() {
      this.playerToken = getActiveToken()
      this.account = getActiveAccount()
    },
    async load() {
      this.loading = true
      this.error = null
      this.syncAuth()
      if (!this.hasValidAcceptToken) {
        this.task = null
        this.error =
          'Ten link jest uszkodzony (brak takiego zadania). Zeskanuj QR jeszcze raz z kartki albo z panelu hosta.'
        this.loading = false
        return
      }
      // Proactively validate a stored token so we don't show "Jako <stale name>".
      if (this.playerToken) {
        try {
          await getMe(this.playerToken)
        } catch (err) {
          if (err && err.playerSessionExpired) {
            this.syncAuth() // token cleared by graClient; re-read cleared state
          }
          // Any other getMe error (network, etc.) is non-fatal; load task anyway.
        }
      }

      try {
        this.task = await getTask(this.acceptToken, this.playerToken || undefined)
      } catch (err) {
        this.task = null
        this.error = (err && err.message) || 'Nie znaleziono zadania.'
      } finally {
        this.loading = false
      }
    },
    async onAccept() {
      if (!this.hasToken) {
        this.promptAccountThenAccept()
        return
      }
      this.accepting = true
      this.error = null
      this.syncAuth()
      try {
        this.task = await acceptTask(this.acceptToken, this.playerToken)
        this.pendingAccept = false
      } catch (err) {
        if (err && err.playerSessionExpired) {
          // Token was wiped; reload so the UI shows the identity modal for re-auth.
          this.pendingAccept = true
          await this.load()
        } else {
          this.error = (err && err.message) || 'Nie udało się przyjąć zadania.'
          await this.load()
        }
      } finally {
        this.accepting = false
      }
    },
    promptAccountThenAccept() {
      this.pendingAccept = true
      this.gateKey += 1
      this.identityModalOpen = true
    },
    closeIdentityModal() {
      this.identityModalOpen = false
      this.pendingAccept = false
    },
    async onAccountReady() {
      this.identityModalOpen = false
      this.syncAuth()
      await this.load()
      if (this.pendingAccept && this.hasToken && this.task && this.task.canAccept) {
        await this.onAccept()
      } else {
        this.pendingAccept = false
      }
    }
  }
}
</script>

<template>
  <GraShell page-title="Zadanie">
    <div class="gra-quest">
      <p v-if="loading" class="gra-quest__loading">Ładowanie…</p>

      <template v-else>
        <div v-if="error" class="gra-quest__alert gra-quest__alert--bad">{{ error }}</div>

        <template v-if="task">
          <article class="gra-quest__sheet" :style="sheetStyle">
            <div class="gra-quest__inner">
              <header class="gra-quest__hero">
                <img class="gra-quest__seal" :src="stampUrl" alt="">
                <p class="gra-quest__eyebrow">OBOZY Festiwal · zadanie</p>
                <h1 class="gra-quest__brand">{{ questHeadline }}</h1>
                <p class="gra-quest__lead">{{ task.summary }}</p>
                <p class="gra-quest__secrecy">
                  Pamiętaj by utrzymywać grę w tajemnicy - nikt nie może wiedzieć że wykonujesz zadanie oprócz innych graczy
                </p>

                <ul class="gra-quest__meta">
                  <li>
                    <span class="gra-quest__meta-label">Punkty</span>
                    <span class="gra-quest__meta-value">{{ task.points }}</span>
                  </li>
                  <li>
                    <span class="gra-quest__meta-label">Gracze</span>
                    <span class="gra-quest__meta-value">{{ task.assigneeCount }}/{{ task.maxAssignees }}</span>
                  </li>
                </ul>
              </header>

              <div v-if="statusText" class="gra-quest__status" :class="'gra-quest__status--' + statusTone">
                {{ statusText }}
              </div>
              <p v-if="takenHint" class="gra-quest__hint">{{ takenHint }}</p>

              <p v-if="showTimer" class="gra-quest__timer">
                <GraSoftTimer :started-at="task.timerStartedAt" :soft-minutes="task.softMinutes" />
                <span class="gra-quest__timer-note">{{ timerNote }}</span>
              </p>

              <div v-if="showBody" class="gra-quest__body">
                <GraMarkdown :source="task.bodyMarkdown" />
              </div>
              <p v-else-if="bodyPendingHint" class="gra-quest__hint">{{ bodyPendingHint }}</p>

              <div v-if="showAccept" class="gra-quest__cta">
                <button type="button" class="btn-large green waves-effect waves-light" :disabled="accepting"
                  @click="onAccept">
                  {{ task.playerAssignmentStatus === 'failed' ? 'Spróbuj ponownie' : 'Przyjmij zadanie' }}
                </button>
              </div>

              <GraOrganizersNote />
            </div>
          </article>

          <p v-if="hasToken" class="gra-quest__player">
            Jako <strong>{{ account && account.displayName }}</strong>
            ·
            <router-link :to="{ name: 'gra-gracz', query: { redirect: $route.fullPath } }">Zmień</router-link>
          </p>

          <div class="gra-quest__rules">
            <GraIntroRules collapsible />
          </div>
        </template>
      </template>
    </div>

    <!-- Identity modal: shown when anonymous user clicks Accept -->
    <div v-if="identityModalOpen" class="gra-modal" role="dialog" aria-modal="true" aria-labelledby="gra-identity-title"
      @click.self="closeIdentityModal">
      <div class="gra-modal__panel card">
        <div class="card-content">
          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem">
            <span id="gra-identity-title" class="card-title" style="font-size: 1.15rem; margin: 0">Kim jesteś?</span>
            <button type="button" class="btn-flat" aria-label="Zamknij" @click="closeIdentityModal">
              <i class="material-icons">close</i>
            </button>
          </div>
          <GraAccountGate :key="gateKey" variant="accept" @ready="onAccountReady" />
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
