<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import GraSoftTimer from '@/components/gra/GraSoftTimer.vue'
import GraAccountGate from '@/components/gra/GraAccountGate.vue'
import GraIntroRules from '@/components/gra/GraIntroRules.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import { acceptTask, getTask } from '@/api/graTasks'
import { getActiveAccount, getActiveToken, getAccounts } from '@/lib/graAccounts'
import { isUsableToken } from '@/lib/graUrls'
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
    /** Real accept when logged in; mock CTA when anonymous and task is free. */
    showAccept() {
      return this.task && this.task.canAccept === true
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
          ? 'Czas powinien ruszyć przy przyjęciu, odśwież widok.'
          : 'Czas ruszy gdy organizator naciśnie „Start zegar”.'
      }
      return this.task.timerStart === 'accept'
        ? 'Czas biegnie od przyjęcia zadania.'
        : 'Czas biegnie od startu u organizatora.'
    },
    takenHint() {
      if (!this.task || this.task.playerAssignmentStatus) return null
      if (this.task.status === 'completed') return 'Zadanie zamknięte.'
      if (!this.task.canAccept && this.hasToken) {
        return 'Niedostępne (zajęte, pełne lub poza oknem czasowym).'
      }
      return null
    },
    /** API: null = still hidden; string (even empty) = revealed. */
    bodyRevealed() {
      return this.task != null && this.task.bodyMarkdown != null
    },
    bodyPendingHint() {
      if (!this.task || this.bodyRevealed) return null
      const type = this.task.logicType
      if (type === 'gated') {
        return 'Pełna treść pojawi się po przyjęciu zadania.'
      }
      if (type === 'coop' || type === 'versus') {
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
          'Ten link jest uszkodzony (brak kodu zadania). Zeskanuj QR jeszcze raz z kartki albo z panelu hosta.'
        this.loading = false
        return
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
        this.error = (err && err.message) || 'Nie udało się przyjąć zadania.'
        await this.load()
      } finally {
        this.accepting = false
      }
    },
    promptAccountThenAccept() {
      this.pendingAccept = true
      this.gateKey += 1
      this.$nextTick(() => {
        const el = this.$refs.accountGate
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },
    async onAccountReady() {
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

              <div v-if="bodyRevealed && task.bodyMarkdown.trim()" class="gra-quest__body gra-md">
                <GraMarkdown :source="task.bodyMarkdown" />
              </div>
              <p v-else-if="bodyPendingHint" class="gra-quest__hint">{{ bodyPendingHint }}</p>

              <div v-if="showAccept" class="gra-quest__cta">
                <button type="button" class="btn-large green waves-effect waves-light" :disabled="accepting"
                  @click="onAccept">
                  {{ task.playerAssignmentStatus === 'failed' ? 'Spróbuj ponownie' : 'Przyjmij zadanie' }}
                </button>
                <p v-if="!hasToken" class="gra-quest__cta-note">
                  {{ pendingAccept
                    ? 'Najpierw załóż lub wybierz gracza poniżej, potem przyjmiemy zadanie za Ciebie.'
                    : 'Po kliknięciu założysz gracza (albo wejdziesz jako istniejący) i od razu przyjmiesz zadanie.' }}
                </p>
              </div>

              <GraOrganizersNote />
            </div>
          </article>

          <section v-if="!hasToken" ref="accountGate" class="gra-quest__side"
            :class="{ 'gra-quest__side--pending': pendingAccept }">
            <p class="gra-quest__side-lead">
              <template v-if="pendingAccept">
                Żeby przyjąć zadanie, załóż nową ksywę albo wejdź jako istniejący gracz.
              </template>
              <template v-else>
                Żeby zbierać punkty, załóż gracza albo wejdź na istniejące konto.
              </template>
            </p>
            <GraAccountGate
              :key="gateKey"
              compact
              :prefer-register="preferRegister"
              @ready="onAccountReady"
            />
          </section>
          <p v-else class="gra-quest__player">
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
  </GraShell>
</template>
