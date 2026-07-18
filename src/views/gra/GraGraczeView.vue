<script>
import GraShell from '@/components/gra/GraShell.vue'
import { getLeaderboard } from '@/api/graPlayers'
import { getActiveAccount } from '@/lib/graAccounts'
import stampUrl from '@/assets/images/festival-stamp.png'
import festivalUrl from '@/assets/images/backgrounds/background-festival.png'

export default {
  name: 'GraGraczeView',
  components: { GraShell },
  data () {
    return {
      loading: true,
      error: null,
      players: [],
      me: null,
      stampUrl,
      festivalUrl
    }
  },
  computed: {
    festStyle () {
      return { '--gra-fest-bg': `url(${this.festivalUrl})` }
    }
  },
  created () {
    this.me = getActiveAccount()
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      this.error = null
      try {
        const res = await getLeaderboard()
        this.players = res.players || []
      } catch (err) {
        this.error = (err && err.message) || 'Nie udało się wczytać rankingu.'
      } finally {
        this.loading = false
      }
    },
    isMe (row) {
      return this.me && this.me.displayName &&
        String(this.me.displayName).toLowerCase() === String(row.displayName).toLowerCase()
    },
    isTopThree (index) {
      return index < 3
    }
  }
}
</script>

<template>
  <GraShell page-title="Gracze">
    <div class="gra-fest" :style="festStyle">
      <div class="gra-fest__panel">
        <header class="gra-fest__hero gra-fest__hero--compact">
          <img class="gra-fest__seal gra-fest__seal--sm" :src="stampUrl" alt="">
          <p class="gra-fest__eyebrow">Tablica wyników</p>
          <h1 class="gra-fest__name">Ranking</h1>
        </header>

        <p class="gra-fest__blurb gra-fest__blurb--tight">
          Trzy najwyższe wyniki wygrywają tajną nagrodę.
        </p>
        <p class="gra-fest__blurb">
          Ci gracze są już w grze i zostali wtajemniczeni. Możesz spróbować wymienić się z nimi
          zadaniami, jeśli reguły konkretnego zadania na to pozwalają.
        </p>

        <p v-if="loading" class="gra-fest__muted">Ładowanie…</p>
        <div v-else-if="error" class="gra-fest__alert">{{ error }}</div>

        <div v-else class="gra-rank__table-wrap">
          <table class="gra-rank__table">
            <thead>
              <tr>
                <th class="gra-rank__th-place">#</th>
                <th>Gracz</th>
                <th class="gra-rank__th-pts">Pkt</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, i) in players"
                :key="p.id"
                :class="{
                  'gra-rank__tr--me': isMe(p),
                  'gra-rank__tr--top': isTopThree(i)
                }"
              >
                <td class="gra-rank__td-place">{{ i + 1 }}</td>
                <td class="gra-rank__td-name">
                  {{ p.displayName }}
                  <span v-if="isMe(p)" class="gra-rank__you">ty</span>
                </td>
                <td class="gra-rank__td-pts">{{ p.score }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="!players.length" class="gra-fest__muted">
            Na razie nikt nie ma punktów na tablicy. Wejdź do gry i bądź pierwszy.
          </p>
        </div>
      </div>
    </div>
  </GraShell>
</template>
