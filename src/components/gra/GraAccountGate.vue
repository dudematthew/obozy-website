<script>
import { listPlayers, registerPlayer, resumePlayerById, resumePlayerByName } from '@/api/graPlayers'
import { getAccounts, upsertAccount } from '@/lib/graAccounts'

export default {
  name: 'GraAccountGate',
  props: {
    compact: { type: Boolean, default: false },
    /** Hide local "Na tym telefonie" when parent already manages that list. */
    hideLocalList: { type: Boolean, default: false },
    /** Prefer "Nowy gracz" tab (e.g. first scan with empty device). */
    preferRegister: { type: Boolean, default: false },
    /**
     * 'accept' — low-friction task-accept variant: no tabs, just a name field,
     *   with discrete links for "Już grałeś?" and "Wybierz z listy".
     */
    variant: { type: String, default: '' }
  },
  emits: ['ready'],
  data() {
    return {
      mode: 'register',
      localAccounts: [],
      remotePlayers: [],
      query: '',
      displayName: '',
      loading: false,
      error: null,
      offerResume: false,
      searchTimer: null
    }
  },
  computed: {
    modeHint() {
      if (this.mode === 'pick') {
        return 'Wybierz osobę z listy. Nie zakłada nowego konta.'
      }
      if (this.mode === 'resume') {
        return 'Podaj istniejącą ksywę. Jeśli nie ma takiego gracza, dostaniesz błąd - wtedy użyj Nowy gracz.'
      }
      return 'Tworzy nowe konto. Jeśli nazwa zajęta, zaproponujemy przełączenie na Już gram.'
    }
  },
  watch: {
    preferRegister: {
      immediate: true,
      handler(prefer) {
        this.applyDefaultMode(prefer)
      }
    }
  },
  mounted() {
    this.localAccounts = getAccounts()
    if (this.variant === 'accept') {
      // Always start on 'register' in accept variant; let user switch explicitly.
      this.mode = 'register'
    } else {
      this.applyDefaultMode(this.preferRegister)
    }
    this.fetchPlayers()
  },
  beforeUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer)
  },
  methods: {
    applyDefaultMode(preferRegister) {
      const locals = getAccounts()
      if (preferRegister || !locals.length) {
        this.mode = 'register'
      } else {
        this.mode = 'pick'
      }
    },
    msg(err) {
      return (err && err.message) || 'Coś poszło nie tak.'
    },
    setMode(mode) {
      this.mode = mode
      this.error = null
      this.offerResume = false
    },
    onQuery() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.fetchPlayers(), 250)
    },
    async fetchPlayers() {
      try {
        const res = await listPlayers(this.query)
        this.remotePlayers = res.players || []
      } catch (err) {
        this.error = this.msg(err)
      }
    },
    finish(player) {
      const account = upsertAccount({
        token: player.token,
        displayName: player.displayName,
        id: player.id
      })
      this.localAccounts = getAccounts()
      this.$emit('ready', account)
    },
    pickLocal(account) {
      upsertAccount(account)
      this.localAccounts = getAccounts()
      this.$emit('ready', account)
    },
    async pickRemote(player) {
      this.loading = true
      this.error = null
      try {
        this.finish(await resumePlayerById(player.id))
      } catch (err) {
        this.error = this.msg(err)
      } finally {
        this.loading = false
      }
    },
    async doResume() {
      const name = this.displayName.trim()
      if (!name) {
        this.error = 'Podaj imię lub ksywę.'
        return
      }
      this.loading = true
      this.error = null
      try {
        this.finish(await resumePlayerByName(name))
      } catch (err) {
        this.error = this.msg(err) || 'Nie znaleziono gracza. Spróbuj Nowy gracz.'
      } finally {
        this.loading = false
      }
    },
    async doRegister() {
      const name = this.displayName.trim()
      if (!name) {
        this.error = 'Podaj imię lub ksywę.'
        return
      }
      this.loading = true
      this.error = null
      this.offerResume = false
      try {
        this.finish(await registerPlayer(name))
      } catch (err) {
        if (err && err.error === 'conflict') {
          this.offerResume = true
          this.error = 'Ta nazwa już istnieje. Wejdź jako istniejący gracz (Już gram)?'
        } else {
          this.error = this.msg(err)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div>
    <!-- ── Default variant ── -->
    <template v-if="variant !== 'accept'">
      <p v-if="!compact" class="grey-text" style="line-height: 1.55">
        Wybierz lub załóż gracza. Zadań nie przegląda się z listy w aplikacji.
        Przyjmujesz je z kartki na terenie: zeskanuj QR albo użyj linku pod kodem.
      </p>

      <div v-if="error" class="text-darken-2 card-panel red lighten-4 red-text">{{ error }}</div>

      <p v-if="offerResume" class="gra-offer-resume">
        <button type="button" class="btn-large green waves-effect waves-light gra-offer-resume__btn" :disabled="loading"
          @click="doResume">
          Wejdź jako "{{ displayName.trim() }}"
        </button>
      </p>

      <div class="gra-mode-tabs">
        <button type="button" class="btn waves-effect"
          :class="mode === 'register' ? 'green' : 'grey lighten-1 black-text'" @click="setMode('register')">Nowy
          gracz</button>
        <button type="button" class="btn waves-effect"
          :class="mode === 'resume' ? 'green' : 'grey lighten-1 black-text'" @click="setMode('resume')">Już
          gram</button>
        <button type="button" class="btn waves-effect" :class="mode === 'pick' ? 'green' : 'grey lighten-1 black-text'"
          @click="setMode('pick')">Lista</button>
      </div>

      <p class="grey-text" style="margin: 0 0 1rem; font-size: 0.9rem">{{ modeHint }}</p>

      <template v-if="mode === 'pick'">
        <div v-if="!hideLocalList && localAccounts.length" style="margin-bottom: 1rem">
          <label class="grey-text">Na tym telefonie</label>
          <div class="collection">
            <button v-for="a in localAccounts" :key="a.token" type="button" class="collection-item gra-pick-btn"
              @click="pickLocal(a)">
              <span>{{ a.displayName }}</span>
              <i class="material-icons green-text">chevron_right</i>
            </button>
          </div>
        </div>

        <label class="grey-text" for="gra-q">Wszyscy gracze</label>
        <input id="gra-q" v-model="query" type="search" class="browser-default gra-field" placeholder="Szukaj…"
          autocomplete="off" @input="onQuery">
        <div v-if="remotePlayers.length" class="collection">
          <button v-for="p in remotePlayers" :key="p.id" type="button" class="collection-item gra-pick-btn"
            :disabled="loading" @click="pickRemote(p)">
            <span>{{ p.displayName }}</span>
            <i class="material-icons green-text">login</i>
          </button>
        </div>
        <p v-else class="grey-text center">Brak wyników.</p>
      </template>

      <div v-else>
        <label for="gra-name">{{ mode === 'register' ? 'Nowa ksywa' : 'Istniejąca ksywa' }}</label>
        <input id="gra-name" v-model="displayName" type="text" class="browser-default gra-field" maxlength="64"
          autocomplete="nickname" @keyup.enter="mode === 'register' ? doRegister() : doResume()">
        <button type="button" class="btn-large green waves-effect waves-light" style="width: 100%" :disabled="loading"
          @click="mode === 'register' ? doRegister() : doResume()">
          {{ mode === 'register' ? 'Załóż gracza' : 'Wejdź jako…' }}
        </button>
      </div>
    </template>

    <!-- ── Accept variant: low-friction, no tabs ── -->
    <template v-else>
      <div v-if="error" class="text-darken-2 card-panel red lighten-4 red-text" style="margin-bottom: 0.75rem">
        {{ error }}
      </div>

      <p v-if="offerResume" class="gra-offer-resume">
        <button type="button" class="btn-large green waves-effect waves-light gra-offer-resume__btn" :disabled="loading"
          @click="doResume">
          Wejdź jako "{{ displayName.trim() }}"
        </button>
      </p>

      <!-- Step: pick from list -->
      <template v-if="mode === 'pick'">
        <div v-if="localAccounts.length" style="margin-bottom: 1rem">
          <label class="grey-text">Na tym telefonie</label>
          <div class="collection">
            <button v-for="a in localAccounts" :key="a.token" type="button" class="collection-item gra-pick-btn"
              @click="pickLocal(a)">
              <span>{{ a.displayName }}</span>
              <i class="material-icons green-text">chevron_right</i>
            </button>
          </div>
        </div>
        <label class="grey-text" for="gra-q-accept">Wszyscy gracze</label>
        <input id="gra-q-accept" v-model="query" type="search" class="browser-default gra-field" placeholder="Szukaj…"
          autocomplete="off" @input="onQuery">
        <div v-if="remotePlayers.length" class="collection" style="margin-bottom: 0.75rem">
          <button v-for="p in remotePlayers" :key="p.id" type="button" class="collection-item gra-pick-btn"
            :disabled="loading" @click="pickRemote(p)">
            <span>{{ p.displayName }}</span>
            <i class="material-icons green-text">login</i>
          </button>
        </div>
        <p v-else class="grey-text center" style="margin-bottom: 0.75rem">Brak wyników.</p>
        <button type="button" class="btn-flat grey-text gra-accept-link" @click="setMode('register')">
          ← Wpisz nową ksywę
        </button>
      </template>

      <!-- Step: resume by name -->
      <template v-else-if="mode === 'resume'">
        <label for="gra-accept-resume">Twoja ksywa</label>
        <input id="gra-accept-resume" v-model="displayName" type="text" class="browser-default gra-field" maxlength="64"
          autocomplete="nickname" autofocus @keyup.enter="doResume">
        <button type="button" class="btn-large green waves-effect waves-light"
          style="width: 100%; margin-bottom: 0.5rem" :disabled="loading" @click="doResume">
          Wejdź jako…
        </button>
        <div class="gra-accept-links">
          <button type="button" class="btn-flat grey-text gra-accept-link" @click="setMode('register')">
            Nowy gracz
          </button>
          <button type="button" class="btn-flat grey-text gra-accept-link" @click="setMode('pick')">
            Wybierz z listy
          </button>
        </div>
      </template>

      <!-- Default step: register (new name) -->
      <template v-else>
        <label for="gra-accept-name">Twoja ksywa / imię (najlepiej unikatowa, której nikt inny nie użyje)</label>
        <input id="gra-accept-name" v-model="displayName" type="text" class="browser-default gra-field" maxlength="64"
          autocomplete="nickname" autofocus @keyup.enter="doRegister">
        <button type="button" class="btn-large green waves-effect waves-light"
          style="width: 100%; margin-bottom: 0.5rem" :disabled="loading" @click="doRegister">
          Przyjmij zadanie
        </button>
        <div class="gra-accept-links">
          <button type="button" class="btn-flat grey-text gra-accept-link" @click="setMode('resume')">
            Już grałeś wcześniej?
          </button>
          <button type="button" class="btn-flat grey-text gra-accept-link" @click="setMode('pick')">
            Wybierz z listy
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.gra-pick-btn {
  width: 100%;
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: none;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}

.gra-pick-btn:hover {
  background: #f5f5f5;
}

.gra-pick-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.gra-offer-resume {
  display: block;
  margin: 0 0 0.75rem;
}

.gra-offer-resume__btn {
  display: block !important;
  width: 100% !important;
  margin: 0;
  box-sizing: border-box;
}

.gra-accept-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.gra-accept-link {
  font-size: 0.85rem;
  text-transform: none;
  padding: 0 0.5rem;
  height: auto;
  line-height: 1.8;
}
</style>
