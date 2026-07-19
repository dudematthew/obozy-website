<script>
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import intro from '@/data/gra-intro.json'
import stampUrl from '@/assets/images/festival-stamp.png'
import atmosphereUrl from '@/assets/images/backgrounds/background-festival-atmosphere.png'

export default {
  name: 'GraQuestPrintSheet',
  components: { GraMarkdown, GraOrganizersNote },
  props: {
    title: { type: String, default: '' },
    playPrintSrc: { type: String, default: '' },
    verifyPrintSrc: { type: String, default: '' },
    playUrl: { type: String, default: '' },
    verifyUrl: { type: String, default: '' },
    playUrlDisplay: { type: String, default: '' },
    verifyUrlDisplay: { type: String, default: '' }
  },
  data() {
    return { intro, stampUrl, atmosphereUrl }
  },
  computed: {
    questHeadline() {
      const name = (this.title || '').trim()
      return name ? `ZADANIE: ${name}` : 'ZADANIE'
    },
    printBodyMarkdown() {
      if (typeof this.intro.printBody === 'string' && this.intro.printBody.trim()) {
        return this.intro.printBody
      }
      if (typeof this.intro.body === 'string' && this.intro.body.trim()) {
        return this.intro.body
      }
      const parts = this.intro.paragraphs
      return Array.isArray(parts) ? parts.join('\n\n') : ''
    },
    sheetStyle() {
      return { '--gra-print-atmosphere': `url(${this.atmosphereUrl})` }
    }
  }
}
</script>

<template>
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
          <img v-if="playPrintSrc" :src="playPrintSrc" alt="QR Przyjmij zadanie">
          <h3>Przyjmij zadanie</h3>
          <p>Zeskanuj telefonem. Dopiero wtedy zobaczysz, o co chodzi, i zarezerwujesz zadanie dla siebie.</p>
          <p class="gra-print-sheet__url-label">Nie możesz? Przepisz ten adres:</p>
          <a class="gra-print-sheet__url" :href="playUrl">{{ playUrlDisplay }}</a>
        </div>
        <div class="gra-print-sheet__code">
          <img v-if="verifyPrintSrc" :src="verifyPrintSrc" alt="QR Sprawdź status zadania">
          <h3>Sprawdź status zadania</h3>
          <p>Podgląd statusu bez możliwości akceptacji. Do wymiany albo gdy musisz kogoś wtajemniczyć.</p>
          <p class="gra-print-sheet__url-label">Nie możesz? Przepisz ten adres:</p>
          <a class="gra-print-sheet__url" :href="verifyUrl">{{ verifyUrlDisplay }}</a>
        </div>
      </section>

      <p class="gra-print-sheet__scan-tip">
        Jeśli telefon nie czyta kodów QR z poziomu aparatu, spróbuj Google Lens albo darmowej aplikacji
        do skanowania kodów QR lub tekstu. Gdy skan w ogóle nie wchodzi w grę, wpisz w przeglądarce adres pod kodem.
      </p>
    </div>
  </article>
</template>
