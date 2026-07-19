<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraIntroRules from '@/components/gra/GraIntroRules.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import { verifyTask } from '@/api/graTasks'
import { isUsableToken } from '@/lib/graUrls'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'

export default {
  name: 'GraVerifyView',
  components: { GraShell, GraIntroRules, GraOrganizersNote },
  data() {
    return {
      loading: true,
      error: null,
      task: null,
      stampUrl,
      atmosphereUrl
    }
  },
  computed: {
    sheetStyle() {
      return { '--gra-quest-atmosphere': `url(${this.atmosphereUrl})` }
    },
    verifyToken() {
      return this.$route.params.verifyToken
    },
    hasValidToken() {
      return isUsableToken(this.verifyToken)
    },
    questHeadline() {
      const name = this.task && (this.task.title || '').trim()
      return name ? `ZADANIE: ${name}` : 'ZADANIE'
    },
    availabilityTone() {
      if (!this.task) return ''
      return this.task.isAvailable ? 'ok' : 'bad'
    },
    availabilityText() {
      if (!this.task) return null
      return this.task.isAvailable
        ? 'Dostępne do przyjęcia.'
        : 'Zadanie niedostępne - zajęte, pełne, zamknięte albo poza oknem czasowym.'
    }
  },
  watch: {
    verifyToken: {
      immediate: true,
      handler() {
        this.load()
      }
    }
  },
  methods: {
    async load() {
      this.loading = true
      this.error = null
      if (!this.hasValidToken) {
        this.task = null
        this.error =
          'Ten link jest uszkodzony (brak kodu zadania). Zeskanuj QR jeszcze raz z kartki albo z panelu hosta.'
        this.loading = false
        return
      }
      try {
        this.task = await verifyTask(this.verifyToken)
      } catch (err) {
        this.task = null
        this.error = (err && err.message) || 'Nie znaleziono zadania.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <GraShell page-title="Sprawdź status">
    <div class="gra-quest">
      <p v-if="loading" class="gra-quest__loading">Sprawdzanie…</p>

      <template v-else>
        <div v-if="error" class="gra-quest__alert gra-quest__alert--bad">{{ error }}</div>

        <template v-if="task">
          <article class="gra-quest__sheet" :style="sheetStyle">
            <div class="gra-quest__inner">
              <header class="gra-quest__hero">
                <img class="gra-quest__seal" :src="stampUrl" alt="">
                <p class="gra-quest__eyebrow">OBOZY Festiwal · status zadania</p>
                <h1 class="gra-quest__brand">{{ questHeadline }}</h1>
                <p v-if="task.summary" class="gra-quest__lead">{{ task.summary }}</p>

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

              <div class="gra-quest__status" :class="'gra-quest__status--' + availabilityTone">
                {{ availabilityText }}
              </div>

              <p class="gra-quest__hint">
                Teraz patrzysz tylko na <strong>status zadania</strong>. Nie możesz go przyjąć. Używa się tej strony
                przy wymianie zadań albo gdy musisz kogoś wtajemniczyć.
              </p>

              <GraOrganizersNote />
            </div>
          </article>

          <div class="gra-quest__rules">
            <GraIntroRules collapsible />
          </div>
        </template>
      </template>
    </div>
  </GraShell>
</template>
