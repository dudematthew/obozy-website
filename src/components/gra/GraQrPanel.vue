<script>
import QRCode from 'qrcode'
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import intro from '@/data/gra-intro.json'
import { displayTaskUrl, isUsableToken, playTaskUrl, verifyTaskUrl } from '@/lib/graUrls'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'

export default {
  name: 'GraQrPanel',
  components: { GraMarkdown, GraOrganizersNote },
  props: {
    acceptToken: { type: String, required: true },
    verifyToken: { type: String, required: true },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    points: { type: Number, default: null },
    logicType: { type: String, default: '' }
  },
  data() {
    return {
      playSrc: '',
      verifySrc: '',
      error: null,
      intro,
      stampUrl,
      atmosphereUrl
    }
  },
  computed: {
    playUrl() {
      return playTaskUrl(this.acceptToken)
    },
    verifyUrl() {
      return verifyTaskUrl(this.verifyToken)
    },
    playUrlDisplay() {
      return displayTaskUrl(this.playUrl)
    },
    verifyUrlDisplay() {
      return displayTaskUrl(this.verifyUrl)
    },
    questHeadline() {
      const name = (this.title || '').trim()
      return name ? `ZADANIE: ${name}` : 'ZADANIE'
    },
    /** Print rules: same spirit as /gra, without repeating the QR bullet list (codes are on the sheet). */
    printBodyMarkdown() {
      if (typeof this.intro.printBody === 'string' && this.intro.printBody.trim()) {
        return this.intro.printBody
      }
      return this.bodyMarkdown
    },
    bodyMarkdown() {
      if (typeof this.intro.body === 'string' && this.intro.body.trim()) {
        return this.intro.body
      }
      const parts = this.intro.paragraphs
      return Array.isArray(parts) ? parts.join('\n\n') : ''
    },
    sheetStyle() {
      return {
        '--gra-print-atmosphere': `url(${this.atmosphereUrl})`
      }
    }
  },
  watch: {
    acceptToken: { immediate: true, handler: 'build' },
    verifyToken: 'build'
  },
  beforeUnmount() {
    document.documentElement.classList.remove('gra-printing')
  },
  methods: {
    async build() {
      this.error = null
      this.playSrc = ''
      this.verifySrc = ''
      if (!isUsableToken(this.acceptToken) || !isUsableToken(this.verifyToken)) {
        this.error = 'Brak tokenów QR dla tego zadania (accept/verify). Odśwież listę hosta.'
        return
      }
      try {
        const opts = { width: 360, margin: 1, errorCorrectionLevel: 'M' }
        this.playSrc = await QRCode.toDataURL(this.playUrl, opts)
        this.verifySrc = await QRCode.toDataURL(this.verifyUrl, opts)
      } catch {
        this.error = 'Nie udało się wygenerować QR.'
      }
    },
    printSheet() {
      const root = document.documentElement
      const cleanup = () => {
        root.classList.remove('gra-printing')
        window.removeEventListener('afterprint', cleanup)
      }
      root.classList.add('gra-printing')
      window.addEventListener('afterprint', cleanup)
      this.$nextTick(() => {
        window.print()
        setTimeout(cleanup, 1000)
      })
    }
  }
}
</script>

<template>
  <div class="gra-qr">
    <div class="card gra-qr__screen">
      <div class="card-content">
        <span class="card-title">Kody QR</span>
        <p class="grey-text">
          Podgląd kartki do druku. Ustaw drukarkę na A4, jedna strona, bez "dopasuj do strony" jeśli obcina marginesy.
          Na kartce jest tytuł, zasady, QR i link pod każdym kodem (gdy ktoś nie ma skanera).
        </p>
        <div v-if="error" class="text-darken-2 card-panel red lighten-4 red-text">{{ error }}</div>
        <div class="gra-qr__preview">
          <div class="gra-qr__preview-cell">
            <img v-if="playSrc" :src="playSrc" alt="QR przyjmij" width="160" height="160">
            <p><strong>Przyjmij</strong></p>
            <a v-if="playUrl" class="gra-qr__link" :href="playUrl" target="_blank" rel="noopener">{{ playUrlDisplay }}</a>
          </div>
          <div class="gra-qr__preview-cell">
            <img v-if="verifySrc" :src="verifySrc" alt="QR potwierdź" width="160" height="160">
            <p><strong>Potwierdź</strong></p>
            <a v-if="verifyUrl" class="gra-qr__link" :href="verifyUrl" target="_blank" rel="noopener">{{ verifyUrlDisplay }}</a>
          </div>
        </div>
        <p class="grey-text gra-qr__tip">
          Bez wbudowanego czytnika: Aparat (wiele telefonów samo czyta QR), Google Lens
          albo darmowa aplikacja do skanowania kodów QR. Awaryjnie wpisz link pod kodem.
        </p>
      </div>
      <div class="card-action">
        <button type="button" class="btn green waves-effect waves-light" @click="printSheet">
          <i class="left material-icons">print</i>
          Drukuj kartkę A4
        </button>
      </div>
    </div>

    <Teleport to="body">
      <article class="gra-print-sheet" aria-hidden="true" :style="sheetStyle">
        <div class="gra-print-sheet__frame">
          <header class="gra-print-sheet__hero">
            <img class="gra-print-sheet__seal" :src="stampUrl" alt="">
            <p class="gra-print-sheet__eyebrow">OBOZY Festiwal</p>
            <h1 class="gra-print-sheet__brand">{{ questHeadline }}</h1>
            <p class="gra-print-sheet__lead">{{ intro.lead }}</p>
          </header>

          <p class="gra-print-sheet__hook">
            Ta kartka sama w sobie nie jest zadaniem. Żeby dowiedzieć się o co w nim chodzi,
            <strong>zeskanuj kod QR albo przepisz link pod nim</strong>.
          </p>

          <section class="gra-print-sheet__rules gra-md">
            <GraMarkdown :source="printBodyMarkdown" />
            <GraOrganizersNote />
          </section>

          <section class="gra-print-sheet__codes">
            <div class="gra-print-sheet__code">
              <img v-if="playSrc" :src="playSrc" alt="QR Przyjmij zadanie">
              <h3>Przyjmij zadanie</h3>
              <p>Zeskanuj telefonem. Dopiero wtedy zobaczysz, o co chodzi, i zarezerwujesz zadanie dla siebie.</p>
              <p class="gra-print-sheet__url-label">Nie możesz? Przepisz ten adres:</p>
              <a class="gra-print-sheet__url" :href="playUrl">{{ playUrlDisplay }}</a>
            </div>
            <div class="gra-print-sheet__code">
              <img v-if="verifySrc" :src="verifySrc" alt="QR Potwierdź zadanie">
              <h3>Potwierdź zadanie</h3>
              <p>Podgląd statusu bez możliwości akceptacji. Do wymiany albo gdy musisz kogoś wtajemniczyć.</p>
              <p class="gra-print-sheet__url-label">Nie możesz? Przepisz ten adres:</p>
              <a class="gra-print-sheet__url" :href="verifyUrl">{{ verifyUrlDisplay }}</a>
            </div>
          </section>

          <p class="gra-print-sheet__scan-tip">
            Jeśli telefon nie czyta kodów QR z poziomu aparatu, spróbuj Google Lens albo darmowej aplikacji
            aplikację do skanowania kodów QR. Gdy skan w ogóle nie wchodzi w grę, wpisz w przeglądarce adres pod kodem.
          </p>
        </div>
      </article>
    </Teleport>
  </div>
</template>

<style scoped>
.gra-qr__preview {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  text-align: center;
  margin-top: 0.75rem;
}

.gra-qr__preview-cell img {
  display: block;
  margin: 0 auto 0.5rem;
}

.gra-qr__link {
  display: block;
  margin-top: 0.6rem;
  font-size: 0.7rem;
  line-height: 1.45;
  word-break: break-all;
  color: #78909c;
}

.gra-qr__tip {
  margin: 1rem 0 0;
  font-size: 0.92rem;
  line-height: 1.5;
}
</style>
