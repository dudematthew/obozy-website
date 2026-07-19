<script>
import GraQuestPrintSheet from '@/components/gra/GraQuestPrintSheet.vue'
import { buildQuestQrBundle, loadQrImage } from '@/lib/graQr'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'
import stampUrl from '@/assets/images/festival-stamp.png'

export default {
  name: 'GraQrPanel',
  components: { GraQuestPrintSheet },
  props: {
    acceptToken: { type: String, required: true },
    verifyToken: { type: String, required: true },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    points: { type: Number, default: null },
    logicType: { type: String, default: '' },
    icon: { type: String, default: '' }
  },
  data() {
    return {
      playSrc: '',
      verifySrc: '',
      playPrintSrc: '',
      verifyPrintSrc: '',
      playUrl: '',
      verifyUrl: '',
      playUrlDisplay: '',
      verifyUrlDisplay: '',
      error: null,
      printing: false,
      stampUrl,
      atmosphereUrl
    }
  },
  watch: {
    acceptToken: { immediate: true, handler: 'build' },
    verifyToken: 'build',
    icon: 'build'
  },
  beforeUnmount() {
    document.documentElement.classList.remove('gra-printing')
  },
  methods: {
    async build() {
      this.error = null
      this.playSrc = ''
      this.verifySrc = ''
      this.playPrintSrc = ''
      this.verifyPrintSrc = ''
      this.playUrl = ''
      this.verifyUrl = ''
      this.playUrlDisplay = ''
      this.verifyUrlDisplay = ''
      try {
        const bundle = await buildQuestQrBundle({
          acceptToken: this.acceptToken,
          verifyToken: this.verifyToken,
          icon: this.icon
        })
        this.playSrc = bundle.playSrc
        this.verifySrc = bundle.verifySrc
        this.playPrintSrc = bundle.playPrintSrc
        this.verifyPrintSrc = bundle.verifyPrintSrc
        this.playUrl = bundle.playUrl
        this.verifyUrl = bundle.verifyUrl
        this.playUrlDisplay = bundle.playUrlDisplay
        this.verifyUrlDisplay = bundle.verifyUrlDisplay
      } catch (err) {
        this.error = (err && err.message) || 'Nie udało się wygenerować QR.'
      }
    },
    async ensurePrintAssets() {
      if (!this.playPrintSrc || !this.verifyPrintSrc) {
        await this.build()
      }
      await Promise.all([
        loadQrImage(this.atmosphereUrl),
        loadQrImage(this.stampUrl),
        loadQrImage(this.playPrintSrc),
        loadQrImage(this.verifyPrintSrc)
      ])
      await this.$nextTick()
    },
    async printSheet() {
      if (this.printing) return
      this.printing = true
      const root = document.documentElement
      const cleanup = () => {
        root.classList.remove('gra-printing')
        window.removeEventListener('afterprint', cleanup)
        this.printing = false
      }
      try {
        await this.ensurePrintAssets()
        if (this.error || !this.playPrintSrc || !this.verifyPrintSrc) {
          this.printing = false
          return
        }
        root.classList.add('gra-printing')
        window.addEventListener('afterprint', cleanup)
        await this.$nextTick()
        window.print()
        setTimeout(cleanup, 1000)
      } catch {
        cleanup()
      }
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
            <a v-if="playUrl" class="gra-qr__link" :href="playUrl" target="_blank" rel="noopener">{{ playUrlDisplay
              }}</a>
          </div>
          <div class="gra-qr__preview-cell">
            <img v-if="verifySrc" :src="verifySrc" alt="QR Sprawdź status" width="160" height="160">
            <p><strong>Sprawdź status</strong></p>
            <a v-if="verifyUrl" class="gra-qr__link" :href="verifyUrl" target="_blank" rel="noopener">{{
              verifyUrlDisplay }}</a>
          </div>
        </div>
        <p class="grey-text gra-qr__tip" style="margin-top: 1rem;">
          Jeśli nie masz wbudowanego czytnika: Aparat (wiele telefonów samo czyta QR), Google Lens
          albo darmowa aplikacja do skanowania kodów QR pomoże. Awaryjnie wpisz link znaleziony pod kodem.
        </p>
      </div>
      <div class="card-action">
        <button type="button" class="btn green waves-effect waves-light" :disabled="printing" @click="printSheet">
          <i class="left material-icons">print</i>
          {{ printing ? 'Przygotowywanie…' : 'Drukuj kartkę A4' }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <GraQuestPrintSheet
        :title="title"
        :play-print-src="playPrintSrc"
        :verify-print-src="verifyPrintSrc"
        :play-url="playUrl"
        :verify-url="verifyUrl"
        :play-url-display="playUrlDisplay"
        :verify-url-display="verifyUrlDisplay"
      />
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
