<script>
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import { loadFestivalSettings, organizersLine } from '@/lib/graFestivalSettings'

const SEEN_KEY = 'obozy-gra-rules-seen'

export default {
  name: 'GraIntroRules',
  components: { GraMarkdown },
  props: {
    /** When true, show as expandable (Play/Verify). When false, always expanded (Intro page). */
    collapsible: { type: Boolean, default: false },
    /** Force open regardless of localStorage (e.g. print). */
    forceOpen: { type: Boolean, default: false }
  },
  data() {
    return {
      settings: null,
      open: true
    }
  },
  computed: {
    title() {
      return (this.settings && this.settings.title) || ''
    },
    lead() {
      return (this.settings && this.settings.lead) || ''
    },
    bodyMarkdown() {
      return (this.settings && this.settings.body) || ''
    },
    scannerHint() {
      return (this.settings && this.settings.scannerHint) || ''
    },
    organizers() {
      return organizersLine(this.settings)
    },
    showBody() {
      if (this.forceOpen || !this.collapsible) return true
      return this.open
    }
  },
  created() {
    loadFestivalSettings().then((s) => {
      this.settings = s
    })
    if (!this.collapsible || this.forceOpen) {
      this.open = true
      return
    }
    try {
      this.open = localStorage.getItem(SEEN_KEY) !== '1'
    } catch {
      this.open = true
    }
  },
  methods: {
    toggle() {
      this.open = !this.open
      if (!this.open) {
        try {
          localStorage.setItem(SEEN_KEY, '1')
        } catch { /* ignore */ }
      }
    },
    markSeen() {
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch { /* ignore */ }
    }
  }
}
</script>

<template>
  <section class="gra-intro-rules">
    <button v-if="collapsible" type="button" class="gra-intro-rules__toggle"
      :aria-expanded="showBody ? 'true' : 'false'" @click="toggle">
      <span>Zasady gry</span>
      <i class="material-icons" aria-hidden="true">{{ showBody ? 'expand_less' : 'expand_more' }}</i>
    </button>

    <div v-show="showBody" class="gra-intro-rules__body gra-intro-copy">
      <h3 v-if="collapsible && title" class="gra-intro-rules__title">{{ title }}</h3>
      <p v-if="collapsible && lead" class="gra-intro-rules__lead">{{ lead }}</p>
      <GraMarkdown v-if="bodyMarkdown" :source="bodyMarkdown" />
      <p v-if="organizers">
        Organizatorzy:
        <strong class="text-darken-2 green-text">{{ organizers }}</strong>.
      </p>
      <p v-if="scannerHint" class="gra-intro-rules__scanner">{{ scannerHint }}</p>
    </div>
  </section>
</template>

<style scoped>
.gra-intro-rules {
  margin: 0;
}

.gra-intro-rules__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  color: #1b5e20;
}

.gra-intro-rules__toggle:hover {
  background: #f1f8e9;
}

.gra-intro-rules__body {
  margin-top: 0.75rem;
}

.gra-intro-rules__title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
}

.gra-intro-rules__lead {
  margin: 0 0 0.85rem;
  color: #455a64;
  line-height: 1.5;
}

.gra-intro-copy :deep(.gra-md) {
  line-height: 1.55;
}

.gra-intro-copy :deep(.gra-md p),
.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  margin: 0 0 0.75rem;
}

.gra-intro-copy :deep(.gra-md strong) {
  font-weight: 800;
}

.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  padding-left: 1.25rem;
}

.gra-intro-rules__scanner {
  margin: 0.85rem 0 0;
  color: #546e7a;
  font-size: 0.92rem;
  line-height: 1.45;
}
</style>
