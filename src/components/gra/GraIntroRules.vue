<script>
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import intro from '@/data/gra-intro.json'

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
      intro,
      open: true
    }
  },
  computed: {
    bodyMarkdown() {
      if (typeof this.intro.body === 'string' && this.intro.body.trim()) {
        return this.intro.body
      }
      const parts = this.intro.paragraphs
      return Array.isArray(parts) ? parts.join('\n\n') : ''
    },
    organizers() {
      const list = this.intro.organizers || []
      return list.length ? list.join(', ') : null
    },
    showBody() {
      if (this.forceOpen || !this.collapsible) return true
      return this.open
    }
  },
  created() {
    if (!this.collapsible || this.forceOpen) {
      this.open = true
      return
    }
    // First visit: open; after they have seen rules, start collapsed
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
      <h3 v-if="collapsible" class="gra-intro-rules__title">{{ intro.title }}</h3>
      <p v-if="collapsible" class="gra-intro-rules__lead">{{ intro.lead }}</p>
      <GraMarkdown :source="bodyMarkdown" />
      <p v-if="organizers">
        Organizatorzy:
        <strong class="text-darken-2 green-text">{{ organizers }}</strong>.
      </p>
      <p v-if="intro.scannerHint" class="gra-intro-rules__scanner">{{ intro.scannerHint }}</p>
    </div>
  </section>
</template>

<style scoped>
.gra-intro-rules {
  margin-top: 1.25rem;
}

.gra-intro-rules__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  font-size: 1rem;
  font-weight: 700;
  color: #1b5e20;
  cursor: pointer;
  text-align: left;
}

.gra-intro-rules__toggle:hover {
  background: #f1f8e9;
}

.gra-intro-rules__body {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.gra-intro-rules__title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.gra-intro-rules__lead {
  margin: 0 0 0.5rem;
  font-weight: 700;
  color: #37474f;
}

.gra-intro-copy :deep(.gra-md) {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #263238;
}

.gra-intro-copy :deep(.gra-md p),
.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  margin: 0 0 1rem;
}

.gra-intro-copy :deep(.gra-md strong) {
  color: #1b5e20;
}

.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  padding-left: 1.35rem;
}

.gra-intro-rules__scanner {
  margin: 1rem 0 0;
  padding-top: 0.75rem;
  border-top: 1px solid #eceff1;
  color: #90a4ae;
  font-size: 0.8rem;
  line-height: 1.5;
}
</style>
