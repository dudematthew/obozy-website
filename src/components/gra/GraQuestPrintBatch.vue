<script>
import GraQuestPrintSheet from '@/components/gra/GraQuestPrintSheet.vue'
import { buildQuestQrBundle, loadQrImage } from '@/lib/graQr'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'

export default {
  name: 'GraQuestPrintBatch',
  components: { GraQuestPrintSheet },
  data() {
    return {
      sheets: [],
      printing: false,
      error: null,
      atmosphereUrl,
      stampUrl
    }
  },
  beforeUnmount() {
    document.documentElement.classList.remove('gra-printing')
  },
  methods: {
    async printTasks(tasks) {
      if (this.printing) return { ok: false, error: 'Już trwa drukowanie.' }
      const list = (tasks || []).filter((t) => t && t.acceptToken && t.verifyToken)
      if (!list.length) {
        return { ok: false, error: 'Zaznacz co najmniej jedno zadanie z tokenami QR.' }
      }

      this.printing = true
      this.error = null
      const root = document.documentElement
      const cleanup = () => {
        root.classList.remove('gra-printing')
        window.removeEventListener('afterprint', cleanup)
        this.printing = false
      }

      try {
        const sheets = await Promise.all(list.map(async (task) => {
          const bundle = await buildQuestQrBundle({
            acceptToken: task.acceptToken,
            verifyToken: task.verifyToken,
            icon: task.icon
          })
          return {
            id: task.id,
            title: task.title || '',
            playPrintSrc: bundle.playPrintSrc,
            verifyPrintSrc: bundle.verifyPrintSrc,
            playUrl: bundle.playUrl,
            verifyUrl: bundle.verifyUrl,
            playUrlDisplay: bundle.playUrlDisplay,
            verifyUrlDisplay: bundle.verifyUrlDisplay
          }
        }))
        this.sheets = sheets

        await Promise.all([
          loadQrImage(this.atmosphereUrl),
          loadQrImage(this.stampUrl),
          ...sheets.flatMap((s) => [
            loadQrImage(s.playPrintSrc),
            loadQrImage(s.verifyPrintSrc)
          ])
        ])
        await this.$nextTick()

        root.classList.add('gra-printing')
        window.addEventListener('afterprint', cleanup)
        await this.$nextTick()
        window.print()
        setTimeout(cleanup, 1500)
        return { ok: true, count: sheets.length }
      } catch (err) {
        cleanup()
        this.sheets = []
        const message = (err && err.message) || 'Nie udało się przygotować kartek.'
        this.error = message
        return { ok: false, error: message }
      }
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="sheets.length" class="gra-print-batch" aria-hidden="true">
      <GraQuestPrintSheet
        v-for="sheet in sheets"
        :key="'print-' + sheet.id"
        :title="sheet.title"
        :play-print-src="sheet.playPrintSrc"
        :verify-print-src="sheet.verifyPrintSrc"
        :play-url="sheet.playUrl"
        :verify-url="sheet.verifyUrl"
        :play-url-display="sheet.playUrlDisplay"
        :verify-url-display="sheet.verifyUrlDisplay"
      />
    </div>
  </Teleport>
</template>
