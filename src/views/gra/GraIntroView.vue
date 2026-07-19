<script>
/* global M */
import GraShell from '@/components/gra/GraShell.vue'
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import intro from '@/data/gra-intro.json'
import { getActiveAccount } from '@/lib/graAccounts'

export default {
  name: 'GraIntroView',
  components: { GraShell, GraMarkdown },
  data() {
    return {
      intro,
      account: null
    }
  },
  computed: {
    organizers() {
      const list = this.intro.organizers || []
      return list.length ? list.join(', ') : null
    },
    bodyMarkdown() {
      if (typeof this.intro.body === 'string' && this.intro.body.trim()) {
        return this.intro.body
      }
      const parts = this.intro.paragraphs
      return Array.isArray(parts) ? parts.join('\n\n') : ''
    }
  },
  mounted() {
    this.account = getActiveAccount()
    try {
      localStorage.setItem('obozy-gra-rules-seen', '1')
    } catch { /* ignore */ }

    // Same as AboutUsView.vue
    const parallaxElems = document.querySelectorAll('.parallax')
    M.Parallax.init(parallaxElems)
  },
  beforeUnmount() {
    document.querySelectorAll('.parallax').forEach((el) => {
      const instance = M.Parallax.getInstance(el)
      if (instance) instance.destroy()
    })
  }
}
</script>

<template>
  <GraShell page-title="Wejście">
    <div class="index-banner parallax-container">
      <div class="section no-pad-bot">
        <div class="container">
          <br><br>
          <p class="center gra-hero__eyebrow">Tajna zabawa festiwalu</p>
          <h1 class="center title gra-hero__title">{{ intro.title }}</h1>
          <p class="center subtitle gra-hero__lead">{{ intro.lead }}</p>
          <br><br>
        </div>
      </div>
      <div class="parallax">
        <img src="@/assets/images/backgrounds/background-festival-atmosphere.png" alt="Tło festiwalu"
          style="filter: brightness(60%)">
      </div>
    </div>

    <div class="gra-page">
      <div class="z-depth-2 card">
        <div class="card-content gra-intro-copy">
          <GraMarkdown :source="bodyMarkdown" />
          <p v-if="organizers">
            Organizatorzy:
            <strong class="text-darken-2 green-text">{{ organizers }}</strong>.
          </p>
        </div>
        <div class="card-action center-align" style="padding: 1.25rem">
          <router-link class="btn-large green waves-effect waves-light" :to="{ name: 'gra-gracz' }">
            {{ account ? 'Twój wynik' : 'Wejdź do gry' }}
          </router-link>
        </div>
      </div>
      <p class="gra-intro-foot">
        Zadań nie znajdziesz na liście w aplikacji. Przyjmujesz je z kartki na terenie:
        skan QR albo link pod kodem, gdy telefon nie skanuje.
      </p>
      <p v-if="intro.scannerHint" class="gra-intro-scanner">{{ intro.scannerHint }}</p>
    </div>
  </GraShell>
</template>

<style scoped>
/*
 * Materialize pins .parallax img with bottom:0, then applies
 * translateY(parallaxDist * scroll%). Near the top of the page that
 * push is already large, so you see the empty upper part of the photo.
 * Raise `bottom` to lift the image and keep the lower part in frame
 * (try 25–50% if you want more/less of the bottom).
 */
.index-banner .parallax img {
  bottom: 40%;
}

.gra-hero__eyebrow {
  font-family: 'Lato', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0 0 0.85rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.gra-hero__title {
  font-family: 'M PLUS Rounded 1c', 'Lato', sans-serif !important;
  font-size: clamp(1.85rem, 6vw, 2.75rem) !important;
  font-weight: 500 !important;
  line-height: 1.15 !important;
  margin: 0 auto 0.85rem !important;
  max-width: 18em;
}

.gra-hero__lead {
  font-family: 'Lato', sans-serif !important;
  font-size: clamp(1.05rem, 2.8vw, 1.35rem) !important;
  font-weight: 600 !important;
  line-height: 1.45 !important;
  margin: 0 auto !important;
  max-width: 28em;
  float: none !important;
  text-align: center !important;
}

.gra-intro-foot {
  margin: 1.25rem auto 0;
  max-width: 36em;
  text-align: center;
  color: #78909c;
  font-size: 0.92rem;
  line-height: 1.55;
}

.gra-intro-scanner {
  margin: 0.85rem auto 0;
  max-width: 34em;
  text-align: center;
  color: #90a4ae;
  font-size: 0.8rem;
  line-height: 1.5;
}

.gra-intro-copy :deep(.gra-md) {
  font-size: 1.1rem;
  line-height: 1.75;
  color: #263238;
}

.gra-intro-copy :deep(.gra-md p),
.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  margin: 0 0 1.15rem;
}

.gra-intro-copy :deep(.gra-md p:last-child),
.gra-intro-copy :deep(.gra-md ul:last-child),
.gra-intro-copy :deep(.gra-md ol:last-child) {
  margin-bottom: 0;
}

.gra-intro-copy :deep(.gra-md strong) {
  color: #1b5e20;
}

.gra-intro-copy :deep(.gra-md ul),
.gra-intro-copy :deep(.gra-md ol) {
  padding-left: 1.35rem;
}

.gra-intro-copy :deep(.gra-md li) {
  margin-bottom: 0.4rem;
}
</style>
