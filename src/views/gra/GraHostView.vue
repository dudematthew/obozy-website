<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraSoftTimer from '@/components/gra/GraSoftTimer.vue'
import GraQuestPrintBatch from '@/components/gra/GraQuestPrintBatch.vue'
import {
  hostComplete,
  hostDeletePlayer,
  hostDeleteTask,
  hostFail,
  hostListTasks,
  hostPlayerAssignments,
  hostRelease,
  hostResolveStake,
  hostResolveVersus,
  hostRevokeCompletion,
  hostSetStake,
  hostStartTimer,
  hostVerifyMaster
} from '@/api/graHost'
import { listPlayers } from '@/api/graPlayers'
import {
  assignmentStatusLabel,
  logicLabel,
  taskStatusLabel,
  taskSupportsStake
} from '@/lib/graLabels'
import {
  clearHostMasterKey,
  clearHostToken,
  getHostHelpOpen,
  getHostMasterKey,
  getHostToken,
  setHostHelpOpen,
  setHostMasterKey,
  setHostToken
} from '@/lib/graHostSession'
import { graIconName } from '@/lib/graIcons'
import { isUsableToken } from '@/lib/graUrls'

const POLL_MS = 20000

export default {
  name: 'GraHostView',
  components: { GraShell, GraSoftTimer, GraQuestPrintBatch },
  data() {
    return {
      password: '',
      hostToken: null,
      masterKey: null,
      masterDraft: '',
      masterBusy: false,
      loading: false,
      error: null,
      tasks: [],
      playerMap: {},
      stakeDraft: {},
      versusDraft: {},
      busy: null,
      showHelp: getHostHelpOpen(),
      showPrep: true,
      pollId: null,
      lookupQuery: '',
      lookupPlayers: [],
      lookupProfile: null,
      lookupLoading: false,
      taskFilter: '',
      statusFilter: 'all',
      selectedTaskIds: [],
      bulkPrinting: false,
      bulkPrintError: null
    }
  },
  computed: {
    masterUnlocked() {
      return Boolean(this.masterKey)
    },
    prepTasks() {
      return (this.tasks || []).filter((t) => String(t.hostNotes || '').trim())
    },
    filteredTasks() {
      const q = this.taskFilter.trim().toLowerCase()
      return (this.tasks || []).filter((task) => {
        if (this.statusFilter !== 'all' && task.status !== this.statusFilter) return false
        if (!q) return true
        const hay = [
          task.title,
          task.summary,
          task.logicType,
          logicLabel(task.logicType),
          taskStatusLabel(task.status),
          String(task.id),
          String(task.points)
        ].join(' ').toLowerCase()
        return hay.includes(q)
      })
    },
    selectedIdSet() {
      return new Set((this.selectedTaskIds || []).map((id) => Number(id)))
    },
    selectedTasks() {
      const set = this.selectedIdSet
      return (this.tasks || []).filter((t) => set.has(Number(t.id)) && this.canPrintTask(t))
    },
    selectedDeleteTasks() {
      const set = this.selectedIdSet
      return (this.tasks || []).filter((t) => set.has(Number(t.id)))
    },
    selectedPrintCount() {
      return this.selectedTasks.length
    },
    selectedDeleteCount() {
      return this.selectedDeleteTasks.length
    },
    allFilteredSelected() {
      const list = this.filteredTasks
      const set = this.selectedIdSet
      return list.length > 0 && list.every((t) => set.has(Number(t.id)))
    }
  },
  created() {
    this.hostToken = getHostToken()
    this.masterKey = getHostMasterKey()
    if (this.hostToken) {
      this.load()
      this.startPoll()
    }
  },
  beforeUnmount() {
    this.stopPoll()
  },
  methods: {
    graIconName,
    logicLabel,
    taskStatusLabel,
    assignmentStatusLabel,
    taskSupportsStake,
    nameOf(id) {
      return this.playerMap[id] || `#${id}`
    },
    payloadHint(a) {
      const p = a && a.payload
      if (!p || typeof p !== 'object') return null
      const bits = []
      if (p.nickname) bits.push(String(p.nickname))
      if (p.organizerName) bits.push(String(p.organizerName))
      if (p.organizer) bits.push(String(p.organizer))
      if (p.item) bits.push(String(p.item))
      if (p.team) bits.push('drużyna ' + String(p.team))
      if (p.displayName) bits.push(String(p.displayName))
      return bits.length ? bits.join(' · ') : null
    },
    softMinutes(task) {
      const m = task && task.logicConfig && task.logicConfig.softMinutes
      return m != null ? Number(m) : null
    },
    needsTimerStart(task, a) {
      return a.status === 'accepted' &&
        this.softMinutes(task) != null &&
        !a.timerStartedAt
    },
    canRelease(task) {
      return task.status !== 'completed' &&
        Array.isArray(task.assignments) &&
        task.assignments.length > 0
    },
    canPrintTask(task) {
      return Boolean(task && isUsableToken(task.acceptToken) && isUsableToken(task.verifyToken))
    },
    selectAllFiltered() {
      const set = new Set((this.selectedTaskIds || []).map((id) => Number(id)))
      this.filteredTasks.forEach((t) => {
        set.add(Number(t.id))
      })
      this.selectedTaskIds = [...set]
    },
    deselectFiltered() {
      const remove = new Set(this.filteredTasks.map((t) => Number(t.id)))
      this.selectedTaskIds = (this.selectedTaskIds || [])
        .map((id) => Number(id))
        .filter((id) => !remove.has(id))
      this.bulkPrintError = null
    },
    clearSelection() {
      this.selectedTaskIds = []
      this.bulkPrintError = null
    },
    toggleSelectAllFiltered() {
      if (this.allFilteredSelected) this.deselectFiltered()
      else this.selectAllFiltered()
    },
    async printSelected() {
      if (this.bulkPrinting || !this.selectedPrintCount) return
      this.bulkPrinting = true
      this.bulkPrintError = null
      try {
        const result = await this.$refs.printBatch.printTasks(this.selectedTasks)
        if (!result || !result.ok) {
          this.bulkPrintError = (result && result.error) || 'Nie udało się wydrukować.'
        }
      } catch (err) {
        this.bulkPrintError = (err && err.message) || 'Nie udało się wydrukować.'
      } finally {
        this.bulkPrinting = false
      }
    },
    deleteSelected() {
      if (!this.masterUnlocked || !this.selectedDeleteCount) return
      const list = this.selectedDeleteTasks
      const ok = window.confirm(
        `Usunąć ${list.length} zaznaczonych zadań z bazy?\n\n` +
        'Kasuje zadania i wszystkie ich przyjęcia. Nie da się cofnąć.'
      )
      if (!ok) return
      return this.act('del-selected', async () => {
        for (const task of list) {
          await hostDeleteTask(this.hostToken, task.id, this.masterKey)
        }
        this.clearSelection()
      })
    },
    acceptedCount(task) {
      return (task.assignments || []).filter((a) => a.status === 'accepted').length
    },
    completedCount(task) {
      return (task.assignments || []).filter((a) => a.status === 'completed').length
    },
    occupancyLabel(task) {
      const total = (task.assignments || []).length
      const active = this.acceptedCount(task)
      if (total === 0) return 'Wolne'
      if (active > 0) return `${active} w trakcie`
      if (this.completedCount(task) > 0 && active === 0) return 'Rozliczone'
      return `${total} przyjęć`
    },
    occupancyClass(task) {
      const total = (task.assignments || []).length
      const active = this.acceptedCount(task)
      if (total === 0) return 'green lighten-4 green-text text-darken-3'
      if (active > 0) return 'orange lighten-4'
      return 'grey lighten-3'
    },
    startPoll() {
      this.stopPoll()
      this.pollId = setInterval(() => {
        if (this.hostToken && !this.busy && !this.loading) this.load({ quiet: true })
      }, POLL_MS)
    },
    stopPoll() {
      if (this.pollId) {
        clearInterval(this.pollId)
        this.pollId = null
      }
    },
    async login() {
      const key = this.password.trim()
      if (!key) {
        this.error = 'Podaj hasło hosta.'
        return
      }
      this.loading = true
      this.error = null
      try {
        setHostToken(key)
        this.hostToken = key
        await hostListTasks(key)
        this.password = ''
        await this.load()
        this.startPoll()
      } catch (err) {
        clearHostToken()
        this.hostToken = null
        this.error = (err && err.message) || 'Błędne hasło.'
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.stopPoll()
      clearHostToken()
      this.hostToken = null
      this.masterKey = null
      this.masterDraft = ''
      this.tasks = []
      this.error = null
      this.lookupProfile = null
      this.busy = null
    },
    async unlockMaster() {
      const key = this.masterDraft.trim()
      if (!key) {
        this.error = 'Podaj klucz master.'
        return
      }
      this.masterBusy = true
      this.error = null
      try {
        await hostVerifyMaster(this.hostToken, key)
        setHostMasterKey(key)
        this.masterKey = key
        this.masterDraft = ''
      } catch (err) {
        clearHostMasterKey()
        this.masterKey = null
        this.error = (err && err.message) || 'Błędny klucz master.'
      } finally {
        this.masterBusy = false
      }
    },
    lockMaster() {
      clearHostMasterKey()
      this.masterKey = null
      this.masterDraft = ''
    },
    deleteTask(task) {
      if (!this.masterUnlocked) return
      const ok = window.confirm(
        `Usunąć zadanie "${task.title}" z bazy?\n\n` +
        'Kasuje zadanie i wszystkie jego przyjęcia. Nie da się cofnąć.'
      )
      if (!ok) return
      return this.act(`del-t-${task.id}`, () => hostDeleteTask(this.hostToken, task.id, this.masterKey))
    },
    deleteLookupPlayer() {
      if (!this.masterUnlocked || !this.lookupProfile) return
      const p = this.lookupProfile.player
      const ok = window.confirm(
        `Usunąć gracza "${p.displayName}" z bazy?\n\n` +
        'Kasuje gracza i wszystkie jego przyjęcia. Punkty znikają. Nie da się cofnąć.'
      )
      if (!ok) return
      return this.act(`del-p-${p.id}`, async () => {
        await hostDeletePlayer(this.hostToken, p.id, this.masterKey)
        this.lookupProfile = null
        this.lookupQuery = ''
      })
    },
    toggleHelp() {
      this.showHelp = !this.showHelp
      setHostHelpOpen(this.showHelp)
    },
    async load(opts = {}) {
      if (!opts.quiet) this.loading = true
      if (!opts.quiet) this.error = null
      try {
        const [taskRes, playersRes] = await Promise.all([
          hostListTasks(this.hostToken),
          listPlayers()
        ])
        this.tasks = taskRes.tasks || []
        const map = {}
          ; (playersRes.players || []).forEach((p) => { map[p.id] = p.displayName })
        this.playerMap = map
      } catch (err) {
        if (err && err.error === 'unauthorized') {
          this.logout()
          this.error = 'Sesja wygasła. Zaloguj ponownie.'
        } else if (!opts.quiet) {
          this.error = (err && err.message) || 'Błąd ładowania.'
        }
      } finally {
        if (!opts.quiet) this.loading = false
      }
    },
    async act(key, fn) {
      this.busy = key
      this.error = null
      try {
        await fn()
        await this.load()
      } catch (err) {
        this.error = (err && err.message) || 'Akcja nieudana.'
      } finally {
        this.busy = null
      }
    },
    complete(a) {
      if (!window.confirm(`Ukończyć zadanie dla ${this.nameOf(a.playerId)}? Przyzna punkty.`)) return
      return this.act(`c-${a.id}`, () => hostComplete(this.hostToken, a.id))
    },
    fail(a) {
      if (!window.confirm(`Odrzucić przyjęcie gracza ${this.nameOf(a.playerId)}? Bez punktów, może spróbować znowu.`)) return
      return this.act(`f-${a.id}`, () => hostFail(this.hostToken, a.id))
    },
    revoke(a) {
      const pts = a.pointsAwarded != null ? a.pointsAwarded : '?'
      if (!window.confirm(
        `Cofnąć ukończenie dla ${this.nameOf(a.playerId)}?\n\n` +
        `Odejmie ${pts} pkt i wróci status "Przyjęte".`
      )) return
      return this.act(`rv-${a.id}`, () => hostRevokeCompletion(this.hostToken, a.id))
    },
    setStake(a) {
      const stake = Number(this.stakeDraft[a.id])
      if (!stake) {
        this.error = 'Podaj stawkę.'
        return
      }
      return this.act(`s-${a.id}`, () => hostSetStake(this.hostToken, a.id, stake))
    },
    resolveStake(a, won) {
      return this.act(`rs-${a.id}`, () => hostResolveStake(this.hostToken, a.id, won))
    },
    startTimer(a) {
      return this.act(`t-${a.id}`, () => hostStartTimer(this.hostToken, a.id))
    },
    resolveVersus(task) {
      const winnerPlayerId = Number(this.versusDraft[task.id])
      if (!winnerPlayerId) {
        this.error = 'Wybierz zwycięzcę.'
        return
      }
      return this.act(`v-${task.id}`, () => hostResolveVersus(this.hostToken, task.id, winnerPlayerId))
    },
    release(task) {
      if (!this.canRelease(task)) return
      const ok = window.confirm(
        `Odblokować zadanie "${task.title}"?\n\n` +
        'Usuwa wszystkie przyjęcia tego zadania i znowu otwiera QR dla każdego.\n' +
        'Nie cofa już przyznanych punktów - do tego służy Cofnij ukończenie.'
      )
      if (!ok) return
      return this.act(`rel-${task.id}`, () => hostRelease(this.hostToken, task.id))
    },
    async onLookupQuery() {
      const q = this.lookupQuery.trim()
      if (!q) {
        this.lookupPlayers = []
        return
      }
      try {
        const res = await listPlayers(q)
        this.lookupPlayers = res.players || []
      } catch (err) {
        this.error = (err && err.message) || 'Błąd wyszukiwania.'
      }
    },
    async openLookup(player) {
      this.lookupLoading = true
      this.lookupProfile = null
      this.error = null
      try {
        this.lookupProfile = await hostPlayerAssignments(this.hostToken, player.id)
        this.lookupQuery = player.displayName
        this.lookupPlayers = []
      } catch (err) {
        this.error = (err && err.message) || 'Nie znaleziono gracza.'
      } finally {
        this.lookupLoading = false
      }
    },
    goTask(task) {
      this.$router.push({ name: 'gra-host-task', params: { id: task.id } })
    }
  }
}
</script>

<template>
  <GraShell page-title="CMR Organizatorów" show-host-link>
    <div class="gra-page">
      <h4 style="margin: 0 0 0.5rem">CMR Organizatorów</h4>
      <p class="grey-text" style="margin: 0 0 1.25rem; line-height: 1.55">
        Panel organizatorów tajnej zabawy. Nie udostępniaj hasła graczom.
      </p>
      <div v-if="error" class="text-darken-2 card-panel red lighten-4 red-text">{{ error }}</div>

      <div v-if="!hostToken" class="card">
        <div class="card-content">
          <label for="host-pass">Hasło hosta</label>
          <input id="host-pass" v-model="password" type="password" class="browser-default gra-field"
            autocomplete="current-password" @keyup.enter="login">
          <button type="button" class="btn-large green waves-effect waves-light" :disabled="loading" @click="login">
            Wejdź
          </button>
        </div>
      </div>

      <template v-else>
        <div class="card" style="margin-bottom: 1.5rem">
          <div class="card-content">
            <div
              style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem">
              <span class="card-title" style="font-size: 1.2rem; margin: 0">Jak używać CMR</span>
              <button type="button" class="btn-flat" @click="toggleHelp">
                {{ showHelp ? 'Zwiń' : 'Pokaż' }}
              </button>
            </div>
            <div v-if="showHelp" class="gra-host-help">
              <p>
                CMR służy do <strong>prowadzenia zadań w terenie</strong>: hostowie chodzą z telefonami,
                widzą kto przyjął zadanie, uznają wynik i poprawiają pomyłki.
                Tworzenie i drukowanie kartek zwykle robisz wcześniej; sekcja na dole jest na wypadek
                gdy trzeba coś dopisać w trakcie.
              </p>
              <p>
                Gdy gracz zeskanuje kod <strong>Przyjmij</strong> i przyjmie zadanie, jego imię pojawia się pod
                zadaniem.
                Gdy skończył, czytasz czy podołał opisowi zadania, i zatwierdzasz, odrzucasz lub informujesz że nie
                możesz zaliczyć. Przy zadaniach z limitem czasu (miękki timer) naciśnij
                <strong>Start zegar</strong> gdy wyzwanie naprawdę startuje — chyba że zadanie ma start
                przy przyjęciu (np. Krzykacz).
              </p>
              <p>
                <strong>Ukończ</strong> przyznaje punkty z karty zadania do wyniku gracza.
                <strong>Odrzuć</strong> oznacza, że próba się nie udała: bez punktów, ale ten sam QR
                może zostać użyty ponownie.
              </p>
              <p>
                Przy <strong>Versus</strong> poczekaj, aż przyjmą obie strony, potem wybierz zwycięzcę
                i rozstrzygnij. Stawkę ustawiasz tylko wtedy, gdy konkretne zadanie tego wymaga.
              </p>
              <p>
                <strong>Odblokuj zadanie</strong> kasuje wszystkie przyjęcia tego zadania i znowu
                otwiera QR do użytku. Nie odejmuje już przyznanych punktów.
              </p>
              <p>
                Jeśli przez pomyłkę kliknąłeś <strong>Ukończ</strong>, użyj
                <strong>Cofnij ukończenie</strong>: odejmie przyznane punkty i wróci status "Przyjęte".
              </p>
              <p>
                Lista <strong>Przygotowania</strong> zawiera notatki organizatora (jakie przedmioty, mapa, co trzeba,
                rekwizyty)
                z wszystkich zadań. Kliknij tytuł albo "Otwórz zadanie", żeby zobaczyć pełną treść i QR.
              </p>
              <p>
                Możesz samodzielnie stworzyć nowe zadanie (po odblokowaniu klucza master). Zadania
                <strong>Zadanie organizatora nr. 1–7</strong> nie mają kartek z kodem QR.
                Zamiast tego możesz werbalnie opisać zadanie i pokazać kod QR graczowi na swoim
                telefonie. Jeśli takie zadanie jest już przyjęte, prawdopodobnie inny organizator go używa — użyj
                innego numeru.
              </p>
            </div>
          </div>
        </div>

        <div class="gra-host-toolbar" style="margin-bottom: 1.25rem">
          <button type="button" class="btn grey waves-effect" :disabled="loading" @click="load()">
            Odśwież
          </button>
          <button type="button" class="btn-flat" @click="logout">Wyloguj</button>
        </div>

        <div class="card" style="margin-bottom: 1.5rem">
          <div class="card-content">
            <span class="card-title" style="font-size: 1.15rem">Szukaj gracza</span>
            <p class="grey-text" style="margin-top: 0; line-height: 1.55">
              Po ksywie zobaczysz wynik i listę jego zadań, w tym przyznane punkty.
              Przydatne gdy spotykasz gracza w terenie.
            </p>
            <input v-model="lookupQuery" type="search" class="browser-default gra-field" placeholder="Szukaj po nazwie…"
              autocomplete="off" @input="onLookupQuery">
            <div v-if="lookupPlayers.length" class="collection">
              <button v-for="p in lookupPlayers" :key="p.id" type="button" class="collection-item"
                style="width: 100%; border: none; background: #fff; text-align: left; cursor: pointer"
                @click="openLookup(p)">
                {{ p.displayName }}
              </button>
            </div>
            <p v-if="lookupLoading" class="grey-text">Ładowanie…</p>
            <div v-if="lookupProfile" style="margin-top: 0.75rem">
              <p>
                <strong>{{ lookupProfile.player.displayName }}</strong>
                · {{ lookupProfile.player.score }} pkt
              </p>
              <ul class="collection">
                <li v-for="a in lookupProfile.assignments" :key="a.assignmentId" class="collection-item">
                  <router-link :to="{ name: 'gra-host-task', params: { id: a.task.id } }">
                    {{ a.task.title }}
                  </router-link>
                  · {{ assignmentStatusLabel(a.status) }}
                  <template v-if="a.pointsAwarded != null"> · {{ a.pointsAwarded }} pkt</template>
                </li>
              </ul>
              <button v-if="masterUnlocked" type="button" class="btn red waves-effect" style="margin-top: 0.75rem"
                :disabled="busy === `del-p-${lookupProfile.player.id}`" @click="deleteLookupPlayer">
                Usuń gracza z bazy
              </button>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 1.25rem">
          <div class="card-content" style="padding-bottom: 0.5rem">
            <span class="card-title" style="font-size: 1.15rem">Zadania</span>
            <div class="gra-host-filters">
              <input v-model="taskFilter" type="search" class="browser-default gra-field" style="margin: 0; flex: 1"
                placeholder="Filtruj po tytule, typie, punktach…" autocomplete="off">
              <select v-model="statusFilter" class="browser-default gra-field"
                style="margin: 0; width: auto; min-width: 9rem">
                <option value="all">Wszystkie</option>
                <option value="available">Dostępne</option>
                <option value="active">W trakcie</option>
                <option value="completed">Ukończone</option>
              </select>
            </div>
            <div class="gra-host-print-bar">
              <label class="gra-host-print-bar__check">
                <input type="checkbox" :checked="allFilteredSelected" :disabled="!filteredTasks.length"
                  @click.prevent="toggleSelectAllFiltered">
                Zaznacz widoczne
              </label>
              <button type="button" class="btn green waves-effect waves-light"
                :disabled="!selectedPrintCount || bulkPrinting || busy === 'del-selected'" @click="printSelected">
                <i class="left material-icons">print</i>
                {{ bulkPrinting ? 'Przygotowywanie…' : `Drukuj zaznaczone (${selectedPrintCount})` }}
              </button>
              <button v-if="masterUnlocked" type="button" class="btn red waves-effect"
                :disabled="!selectedDeleteCount || bulkPrinting || busy === 'del-selected'" @click="deleteSelected">
                {{ busy === 'del-selected' ? 'Usuwanie…' : `Usuń zaznaczone (${selectedDeleteCount})` }}
              </button>
              <button v-if="selectedDeleteCount" type="button" class="btn-flat"
                :disabled="bulkPrinting || busy === 'del-selected'" @click="clearSelection">
                Wyczyść
              </button>
            </div>
            <p v-if="bulkPrintError" class="text-darken-2 red-text" style="margin: 0.5rem 0 0">{{ bulkPrintError }}</p>
          </div>
        </div>

        <GraQuestPrintBatch ref="printBatch" />

        <p v-if="loading && !tasks.length" class="center grey-text">Ładowanie…</p>

        <div v-for="task in filteredTasks" :key="task.id" class="card gra-host-task-card"
          style="margin-bottom: 1.25rem">
          <div class="card-content">
            <div class="gra-host-task-card__top">
              <label class="gra-host-task-card__select" title="Zaznacz do druku / usunięcia">
                <input v-model="selectedTaskIds" type="checkbox" :value="Number(task.id)">
              </label>
              <p style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; flex: 1">
                <span class="chip green lighten-4" style="margin: 0">
                  <i class="material-icons" style="font-size: 1rem; vertical-align: middle">{{ graIconName(task.icon)
                    }}</i>
                  {{ logicLabel(task.logicType) }}
                </span>
                <span class="chip" style="margin: 0">{{ taskStatusLabel(task.status) }}</span>
                <span class="chip" style="margin: 0">{{ task.points }} pkt</span>
                <span class="chip" style="margin: 0" :class="occupancyClass(task)">{{ occupancyLabel(task) }}</span>
              </p>
            </div>

            <button type="button" class="gra-host-task-title" @click="goTask(task)">
              {{ task.title }}
            </button>
            <p v-if="task.summary" class="gra-host-task-summary">{{ task.summary }}</p>

            <div class="gra-host-toolbar" style="margin: 1rem 0">
              <button type="button" class="btn green waves-effect" @click="goTask(task)">
                Otwórz zadanie
              </button>
              <button type="button" class="btn red waves-effect"
                :disabled="busy === `rel-${task.id}` || !canRelease(task)"
                :title="canRelease(task) ? 'Kasuje przyjęcia i otwiera zadanie ponownie' : 'Brak przyjęć do odblokowania'"
                @click="release(task)">
                Odblokuj zadanie
              </button>
              <button v-if="masterUnlocked" type="button" class="btn-flat red-text"
                :disabled="busy === `del-t-${task.id}`" @click="deleteTask(task)">
                Usuń z bazy
              </button>
            </div>

            <div v-if="!(task.assignments && task.assignments.length)" class="gra-host-empty">
              Nikt jeszcze nie przyjął tego zadania. Kod QR jest wolny.
            </div>

            <ul v-else class="collection">
              <li v-for="a in task.assignments" :key="a.id" class="collection-item">
                <strong>{{ nameOf(a.playerId) }}</strong>
                <span class="chip" style="margin-left: 0.35rem">{{ assignmentStatusLabel(a.status) }}</span>
                <span v-if="a.status === 'completed' && a.pointsAwarded != null" class="chip green lighten-4"
                  style="margin-left: 0.35rem">
                  +{{ a.pointsAwarded }} pkt
                </span>
                <GraSoftTimer v-if="a.status === 'accepted' && softMinutes(task)" :started-at="a.timerStartedAt"
                  :soft-minutes="softMinutes(task)" style="margin-left: 0.35rem" />
                <br>
                <small class="grey-text">
                  #{{ a.id }} · {{ a.acceptedAt }}
                  <template v-if="a.timerStartedAt"> · zegar {{ a.timerStartedAt }}</template>
                  <template v-if="taskSupportsStake(task) && a.stake != null"> · stawka {{ a.stake }}</template>
                  <template v-if="payloadHint(a)"> · {{ payloadHint(a) }}</template>
                </small>
                <div v-if="a.status === 'accepted'" class="gra-host-toolbar" style="margin-top: 0.65rem">
                  <button v-if="needsTimerStart(task, a)" type="button" class="btn orange waves-effect"
                    :disabled="busy === `t-${a.id}`" @click="startTimer(a)">Start zegar</button>
                  <button v-if="task.logicType !== 'versus'" type="button" class="btn green waves-effect"
                    :disabled="busy === `c-${a.id}`" @click="complete(a)">Ukończ</button>
                  <button type="button" class="btn red waves-effect" :disabled="busy === `f-${a.id}`"
                    @click="fail(a)">Odrzuć</button>
                  <template v-if="taskSupportsStake(task) && a.stake == null">
                    <input v-model="stakeDraft[a.id]" type="number" min="1" class="browser-default" placeholder="stawka"
                      style="width: 5rem; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px">
                    <button type="button" class="btn grey waves-effect" @click="setStake(a)">Ustaw stawkę</button>
                  </template>
                  <template v-else-if="taskSupportsStake(task) && a.stake != null">
                    <button type="button" class="btn green waves-effect" @click="resolveStake(a, true)">Stawka
                      +</button>
                    <button type="button" class="btn orange waves-effect" @click="resolveStake(a, false)">Stawka
                      −</button>
                  </template>
                </div>
                <div v-else-if="a.status === 'completed'" class="gra-host-toolbar" style="margin-top: 0.65rem">
                  <button type="button" class="btn orange waves-effect" :disabled="busy === `rv-${a.id}`"
                    @click="revoke(a)">Cofnij ukończenie</button>
                </div>
              </li>
            </ul>

            <div v-if="task.logicType === 'versus' && task.status !== 'completed'" class="card-panel grey lighten-4"
              style="margin-top: 1rem">
              <label>Versus: zwycięzca</label>
              <select v-model="versusDraft[task.id]" class="browser-default gra-field">
                <option disabled value="">Wybierz</option>
                <option v-for="a in (task.assignments || []).filter(x => x.status === 'accepted')" :key="a.id"
                  :value="a.playerId">
                  {{ nameOf(a.playerId) }}
                </option>
              </select>
              <button type="button" class="btn green waves-effect" @click="resolveVersus(task)">
                Rozstrzygnij versus
              </button>
            </div>
          </div>
        </div>

        <p v-if="!loading && tasks.length && !filteredTasks.length" class="center grey-text" style="line-height: 1.55">
          Żadne zadanie nie pasuje do filtra. Wyczyść wyszukiwanie albo zmień status.
        </p>
        <p v-if="!loading && !tasks.length" class="center grey-text">Brak zadań na serwerze.</p>

        <div class="card gra-host-prep">
          <div class="card-content gra-host-prep__inner">
            <div class="gra-host-prep__copy">
              <span class="card-title gra-host-prep__title">Przygotowanie zadań</span>
              <p class="gra-host-prep__text">
                Tworzenie questów i druk kartek zwykle robisz przed startem zabawy.
                Tutaj możesz dodać nowe zadanie, jeśli coś wypadło w trakcie festiwalu.
                Wymaga odblokowanego klucza master.
              </p>
            </div>
            <router-link v-if="masterUnlocked" class="btn green waves-effect waves-light gra-host-prep__btn"
              :to="{ name: 'gra-host-new' }">
              Nowe zadanie
            </router-link>
            <button v-else type="button" class="btn grey waves-effect gra-host-prep__btn" disabled
              title="Najpierw odblokuj klucz master">
              Nowe zadanie (zablokowane)
            </button>
          </div>
        </div>

        <div v-if="prepTasks.length" class="card" style="margin-top: 1.5rem; margin-bottom: 0.5rem">
          <div class="card-content">
            <div
              style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem">
              <span class="card-title" style="font-size: 1.15rem; margin: 0">Przygotowania</span>
              <button type="button" class="btn-flat" @click="showPrep = !showPrep">
                {{ showPrep ? 'Zwiń' : 'Pokaż' }}
              </button>
            </div>
            <template v-if="showPrep">
              <p class="grey-text" style="margin-top: 0; line-height: 1.55">
                Checklist rekwizytów i setupu z notatek hosta. Tylko dla organizatorów.
              </p>
              <ul class="collection" style="margin-bottom: 0">
                <li v-for="t in prepTasks" :key="'prep-' + t.id" class="collection-item">
                  <button type="button" class="btn-flat" style="padding-left: 0; text-transform: none; font-weight: 700"
                    @click="goTask(t)">
                    {{ t.title }}
                  </button>
                  <p style="margin: 0.35rem 0 0; white-space: pre-wrap; line-height: 1.45; color: #37474f">{{
                    t.hostNotes }}</p>
                </li>
              </ul>
            </template>
          </div>
        </div>

        <div class="card" style="margin-top: 1.5rem; margin-bottom: 0.5rem">
          <div class="card-content">
            <span class="card-title" style="font-size: 1.15rem">Klucz master</span>
            <p class="grey-text" style="margin-top: 0; line-height: 1.55">
              Drugie hasło z serwera (<code>HOST_MASTER_KEY</code>). Odblokowuje tworzenie i usuwanie zadań
              oraz usuwanie graczy. Zwykłe CMR (ukończ / odrzuć / odblokuj) działa bez niego.
            </p>
            <template v-if="!masterUnlocked">
              <label for="master-pass">Klucz master</label>
              <input id="master-pass" v-model="masterDraft" type="password" class="browser-default gra-field"
                autocomplete="off" @keyup.enter="unlockMaster">
              <button type="button" class="btn orange waves-effect" :disabled="masterBusy" @click="unlockMaster">
                Odblokuj zaawansowane czynności
              </button>
            </template>
            <template v-else>
              <p class="text-darken-2 green-text" style="margin: 0 0 0.75rem">
                Destrukcyjne akcje odblokowane na tej sesji.
              </p>
              <button type="button" class="btn-flat" @click="lockMaster">Zablokuj ponownie</button>
            </template>
          </div>
        </div>
      </template>
    </div>
  </GraShell>
</template>

<style scoped>
.gra-host-help p {
  margin: 0 0 1rem;
  line-height: 1.65;
  color: #37474f;
}

.gra-host-help p:last-child {
  margin-bottom: 0;
}

.gra-host-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.gra-host-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.75rem 0 0.25rem;
}

.gra-host-print-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin: 0.85rem 0 0.25rem;
}

.gra-host-print-bar__check {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  cursor: pointer;
  user-select: none;
  color: #455a64;
  font-size: 0.95rem;
}

/* Materialize hides native checkboxes (opacity:0; position:absolute; pointer-events:none).
   Per-task labels then collapse — select-all still works via its text. Force real boxes. */
.gra-host-print-bar__check input[type='checkbox'],
.gra-host-task-card__select input[type='checkbox'] {
  position: static !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  width: 1.15rem;
  height: 1.15rem;
  margin: 0;
  flex: 0 0 auto;
  cursor: pointer;
  accent-color: #2e7d32;
}

.gra-host-task-card__top {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.gra-host-task-card__select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0.2rem 0 0;
  padding: 0.35rem;
  cursor: pointer;
  min-width: 2rem;
  min-height: 2rem;
}

.gra-host-task-card__select input {
  width: 1.15rem;
  height: 1.15rem;
}

.gra-host-task-title {
  display: block;
  width: 100%;
  margin: 0 0 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
  color: #1b5e20;
}

.gra-host-task-title:hover {
  text-decoration: underline;
}

.gra-host-task-summary {
  margin: 0;
  color: #546e7a;
  line-height: 1.5;
}

.gra-host-empty {
  margin: 0.5rem 0 0;
  padding: 0.85rem 1rem;
  background: #e8f5e9;
  border-left: 4px solid #43a047;
  color: #1b5e20;
  font-weight: 600;
  line-height: 1.45;
}

.gra-host-prep {
  margin: 1.5rem 0 0.5rem;
}

.gra-host-prep__inner {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.85rem;
  padding-bottom: 1rem !important;
}

.gra-host-prep__title {
  font-size: 1.15rem !important;
  margin-bottom: 0.35rem !important;
  line-height: 1.25;
}

.gra-host-prep__text {
  margin: 0;
  max-width: 40em;
  color: #546e7a;
  line-height: 1.5;
  font-size: 0.95rem;
}

.gra-host-prep__btn {
  align-self: flex-start;
  margin: 0;
}

@media (min-width: 700px) {
  .gra-host-prep__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    padding-top: 1.1rem !important;
    padding-bottom: 1.1rem !important;
  }

  .gra-host-prep__copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .gra-host-prep__btn {
    flex: 0 0 auto;
    align-self: center;
  }
}
</style>
