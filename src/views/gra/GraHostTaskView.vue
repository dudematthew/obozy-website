<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraTaskForm from '@/components/gra/GraTaskForm.vue'
import GraQrPanel from '@/components/gra/GraQrPanel.vue'
import GraMarkdown from '@/components/gra/GraMarkdown.vue'
import GraSoftTimer from '@/components/gra/GraSoftTimer.vue'
import {
  hostComplete,
  hostFail,
  hostListTasks,
  hostRelease,
  hostResolveStake,
  hostResolveVersus,
  hostRevokeCompletion,
  hostSetStake,
  hostUpdateTask
} from '@/api/graHost'
import { listPlayers } from '@/api/graPlayers'
import {
  assignmentStatusLabel,
  logicLabel,
  taskStatusLabel,
  taskSupportsStake
} from '@/lib/graLabels'
import { getHostToken } from '@/lib/graHostSession'
import { graIconName } from '@/lib/graIcons'

export default {
  name: 'GraHostTaskView',
  components: { GraShell, GraTaskForm, GraQrPanel, GraMarkdown, GraSoftTimer },
  data() {
    return {
      hostToken: null,
      task: null,
      playerMap: {},
      loading: true,
      saving: false,
      error: null,
      okMsg: null,
      stakeDraft: {},
      versusWinner: '',
      busy: null
    }
  },
  computed: {
    taskId() {
      return Number(this.$route.params.id)
    },
    canRelease() {
      return this.task &&
        this.task.status !== 'completed' &&
        Array.isArray(this.task.assignments) &&
        this.task.assignments.length > 0
    },
    softMinutes() {
      const m = this.task && this.task.logicConfig && this.task.logicConfig.softMinutes
      return m != null ? Number(m) : null
    }
  },
  created() {
    this.hostToken = getHostToken()
    if (!this.hostToken) {
      this.$router.replace({ name: 'gra-host' })
      return
    }
    this.load()
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
      return bits.length ? bits.join(' · ') : null
    },
    async load() {
      this.loading = true
      this.error = null
      try {
        const [taskRes, playersRes] = await Promise.all([
          hostListTasks(this.hostToken),
          listPlayers()
        ])
        const map = {}
          ; (playersRes.players || []).forEach((p) => { map[p.id] = p.displayName })
        this.playerMap = map
        this.task = (taskRes.tasks || []).find((t) => t.id === this.taskId) || null
        if (!this.task) this.error = 'Nie znaleziono zadania.'
      } catch (err) {
        this.error = (err && err.message) || 'Błąd ładowania.'
      } finally {
        this.loading = false
      }
    },
    async onSubmit(payload, err) {
      if (err) {
        this.error = err.message || String(err)
        return
      }
      this.saving = true
      this.error = null
      this.okMsg = null
      try {
        await hostUpdateTask(this.hostToken, this.taskId, payload)
        this.okMsg = 'Zapisano.'
        await this.load()
      } catch (e) {
        this.error = (e && e.message) || 'Nie udało się zapisać.'
      } finally {
        this.saving = false
      }
    },
    async act(key, fn) {
      this.busy = key
      this.error = null
      try {
        await fn()
        await this.load()
      } catch (e) {
        this.error = (e && e.message) || 'Akcja nieudana.'
      } finally {
        this.busy = null
      }
    },
    complete(a) {
      if (!window.confirm(`Ukończyć dla ${this.nameOf(a.playerId)}? Przyzna punkty.`)) return
      return this.act(`c-${a.id}`, () => hostComplete(this.hostToken, a.id))
    },
    fail(a) {
      if (!window.confirm(`Odrzucić przyjęcie gracza ${this.nameOf(a.playerId)}?`)) return
      return this.act(`f-${a.id}`, () => hostFail(this.hostToken, a.id))
    },
    revoke(a) {
      const pts = a.pointsAwarded != null ? a.pointsAwarded : '?'
      if (!window.confirm(`Cofnąć ukończenie? Odejmie ${pts} pkt.`)) return
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
    resolveVersus() {
      const winnerPlayerId = Number(this.versusWinner)
      if (!winnerPlayerId) {
        this.error = 'Wybierz zwycięzcę.'
        return
      }
      return this.act('versus', () => hostResolveVersus(this.hostToken, this.taskId, winnerPlayerId))
    },
    release() {
      if (!this.canRelease) return
      const ok = window.confirm(
        'Zwolnić wszystkie przyjęcia tego zadania?\n\n' +
        'Nie cofa przyznanych punktów - użyj Cofnij ukończenie.'
      )
      if (!ok) return
      return this.act('release', () => hostRelease(this.hostToken, this.taskId))
    }
  }
}
</script>

<template>
  <GraShell page-title="Organizacja" show-host-link>
    <div class="gra-page">
      <p><router-link :to="{ name: 'gra-host' }">← Tablica</router-link></p>
      <p v-if="loading" class="center grey-text">Ładowanie…</p>
      <div v-if="error" class="text-darken-2 card-panel red lighten-4 red-text">{{ error }}</div>
      <div v-if="okMsg" class="text-darken-3 card-panel green lighten-4 green-text">{{ okMsg }}</div>

      <template v-if="task">
        <h4 style="margin-top: 0; word-break: break-word">
          <i class="material-icons green-text" style="vertical-align: middle">{{ graIconName(task.icon) }}</i>
          {{ task.title }}
        </h4>
        <p style="display: flex; flex-wrap: wrap; gap: 0.35rem">
          <span class="chip" style="margin: 0">#{{ task.id }}</span>
          <span class="chip green lighten-4" style="margin: 0">{{ logicLabel(task.logicType) }}</span>
          <span class="chip" style="margin: 0">{{ taskStatusLabel(task.status) }}</span>
          <span class="chip" style="margin: 0">{{ task.points }} pkt</span>
        </p>

        <GraQrPanel :accept-token="task.acceptToken" :verify-token="task.verifyToken" :title="task.title"
          :summary="task.summary" :points="task.points" :logic-type="task.logicType" />

        <div class="card" style="margin-top: 1.25rem">
          <div class="card-content">
            <span class="card-title">Podgląd</span>
            <p class="grey-text">{{ task.summary }}</p>
            <GraMarkdown v-if="task.bodyMarkdown" :source="task.bodyMarkdown" />
          </div>
        </div>

        <div v-if="task.hostNotes" class="card" style="margin-top: 1.25rem">
          <div class="card-content">
            <span class="card-title">Przygotowanie / notatki hosta</span>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.55; color: #37474f">{{ task.hostNotes }}</p>
          </div>
        </div>

        <div class="card" style="margin-top: 1.25rem">
          <div class="card-content">
            <span class="card-title">Przyjęcia</span>
            <ul v-if="task.assignments && task.assignments.length" class="collection">
              <li v-for="a in task.assignments" :key="a.id" class="collection-item">
                <strong>{{ nameOf(a.playerId) }}</strong>
                <span class="chip" style="margin-left: 0.35rem">{{ assignmentStatusLabel(a.status) }}</span>
                <span v-if="a.status === 'completed' && a.pointsAwarded != null" class="chip green lighten-4"
                  style="margin-left: 0.35rem">
                  +{{ a.pointsAwarded }} pkt
                </span>
                <GraSoftTimer v-if="a.status === 'accepted' && softMinutes" :accepted-at="a.acceptedAt"
                  :soft-minutes="softMinutes" style="margin-left: 0.35rem" />
                <small v-if="payloadHint(a)" class="grey-text" style="display: block">{{ payloadHint(a) }}</small>
                <div v-if="a.status === 'accepted'"
                  style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem">
                  <button v-if="task.logicType !== 'versus'" type="button" class="btn green waves-effect"
                    @click="complete(a)">Ukończ</button>
                  <button type="button" class="btn red waves-effect" @click="fail(a)">Odrzuć</button>
                  <template v-if="taskSupportsStake(task) && a.stake == null">
                    <input v-model="stakeDraft[a.id]" type="number" class="browser-default"
                      style="width: 5rem; padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px"
                      placeholder="stawka">
                    <button type="button" class="btn grey waves-effect" @click="setStake(a)">Ustaw stawkę</button>
                  </template>
                  <template v-else-if="taskSupportsStake(task) && a.stake != null">
                    <button type="button" class="btn green waves-effect" @click="resolveStake(a, true)">Stawka
                      +</button>
                    <button type="button" class="btn orange waves-effect" @click="resolveStake(a, false)">Stawka
                      −</button>
                  </template>
                </div>
                <div v-else-if="a.status === 'completed'" style="margin-top: 0.5rem">
                  <button type="button" class="btn orange waves-effect" @click="revoke(a)">Cofnij ukończenie</button>
                </div>
              </li>
            </ul>
            <p v-else class="text-darken-3 card-panel green lighten-5 green-text" style="margin-top: 0.5rem">
              Nikt jeszcze nie przyjął tego zadania. Kod QR jest wolny.
            </p>

            <div v-if="task.logicType === 'versus' && task.status !== 'completed'" style="margin-top: 1rem">
              <label>Versus: zwycięzca</label>
              <select v-model="versusWinner" class="browser-default gra-field">
                <option disabled value="">Wybierz</option>
                <option v-for="a in task.assignments.filter(x => x.status === 'accepted')" :key="a.id"
                  :value="a.playerId">
                  {{ nameOf(a.playerId) }}
                </option>
              </select>
              <button type="button" class="btn green waves-effect" @click="resolveVersus">Rozstrzygnij versus</button>
            </div>

            <p style="margin-top: 1rem">
              <button type="button" class="btn red waves-effect" :disabled="!canRelease || busy === 'release'"
                @click="release">
                Zwolnij zadanie
              </button>
            </p>
          </div>
        </div>

        <div class="card" style="margin-top: 1.25rem">
          <div class="card-content">
            <span class="card-title">Edycja</span>
            <GraTaskForm :initial="task" submit-label="Zapisz zmiany" :loading="saving" @submit="onSubmit" />
          </div>
        </div>
      </template>
    </div>
  </GraShell>
</template>
