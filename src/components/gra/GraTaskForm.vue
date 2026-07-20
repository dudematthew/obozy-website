<script>
import { LOGIC_LABELS, TASK_STATUS_LABELS } from '@/lib/graLabels'
import { GRA_ICON_KEYS } from '@/lib/graIcons'

const TYPES = ['instant', 'gated', 'coop', 'versus']
const STATUSES = ['available', 'active', 'completed']
const BODY_REVEALS = [
  { value: '', label: 'Domyślnie (wg typu)' },
  { value: 'always', label: 'Zawsze widoczna' },
  { value: 'onAccept', label: 'Po przyjęciu' },
  { value: 'whenFull', label: 'Gdy drużyna pełna' }
]

export default {
  name: 'GraTaskForm',
  props: {
    initial: { type: Object, default: null },
    submitLabel: { type: String, default: 'Zapisz' },
    loading: { type: Boolean, default: false }
  },
  emits: ['submit'],
  data() {
    return {
      types: TYPES,
      statuses: STATUSES,
      bodyReveals: BODY_REVEALS,
      logicLabels: LOGIC_LABELS,
      statusLabels: TASK_STATUS_LABELS,
      iconKeys: GRA_ICON_KEYS,
      title: '',
      icon: '',
      summary: '',
      bodyMarkdown: '',
      hostNotes: '',
      points: 0,
      logicType: 'instant',
      maxAssignees: 1,
      status: '',
      acceptOpensAt: '',
      acceptClosesAt: '',
      softMinutes: '',
      timerStart: '',
      stakeMin: '',
      stakeMax: '',
      bodyReveal: '',
      nicknamePoolText: '',
      organizerPoolText: '',
      itemPoolText: '',
      logicConfigExtra: ''
    }
  },
  watch: {
    initial: {
      immediate: true,
      handler(val) {
        if (!val) return
        this.title = val.title || ''
        this.icon = val.icon || ''
        this.summary = val.summary || ''
        this.bodyMarkdown = val.bodyMarkdown || ''
        this.hostNotes = val.hostNotes || ''
        this.points = val.points != null ? val.points : 0
        this.logicType = val.logicType || 'instant'
        this.maxAssignees = val.maxAssignees != null ? val.maxAssignees : 1
        this.status = val.status || ''
        this.acceptOpensAt = val.acceptOpensAt || ''
        this.acceptClosesAt = val.acceptClosesAt || ''
        const cfg = val.logicConfig || {}
        this.softMinutes = cfg.softMinutes != null ? cfg.softMinutes : ''
        this.timerStart = cfg.timerStart || ''
        this.stakeMin = cfg.stakeMin != null ? cfg.stakeMin : ''
        this.stakeMax = cfg.stakeMax != null ? cfg.stakeMax : ''
        this.bodyReveal = cfg.bodyReveal || ''
        this.nicknamePoolText = Array.isArray(cfg.nicknamePool) ? cfg.nicknamePool.join('\n') : ''
        this.organizerPoolText = Array.isArray(cfg.organizerPool) ? cfg.organizerPool.join('\n') : ''
        this.itemPoolText = Array.isArray(cfg.itemPool) ? cfg.itemPool.join('\n') : ''
        const rest = { ...cfg }
          ;['softMinutes', 'timerStart', 'nicknamePool', 'organizerPool', 'itemPool', 'stakeMin', 'stakeMax', 'bodyReveal'].forEach((k) => delete rest[k])
        this.logicConfigExtra = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
      }
    }
  },
  methods: {
    lines(text) {
      return String(text || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    },
    onSubmit() {
      try {
        if (!this.title.trim()) {
          this.$emit('submit', null, new Error('Tytuł jest wymagany.'))
          return
        }
        const logicConfig = {}
        if (this.softMinutes !== '' && this.softMinutes != null) logicConfig.softMinutes = Number(this.softMinutes)
        if (this.timerStart) logicConfig.timerStart = this.timerStart
        if (this.stakeMin !== '' && this.stakeMin != null) logicConfig.stakeMin = Number(this.stakeMin)
        if (this.stakeMax !== '' && this.stakeMax != null) logicConfig.stakeMax = Number(this.stakeMax)
        if (this.bodyReveal) logicConfig.bodyReveal = this.bodyReveal
        const nick = this.lines(this.nicknamePoolText)
        const org = this.lines(this.organizerPoolText)
        const items = this.lines(this.itemPoolText)
        if (nick.length) logicConfig.nicknamePool = nick
        if (org.length) logicConfig.organizerPool = org
        if (items.length) logicConfig.itemPool = items
        if (this.logicConfigExtra.trim()) {
          Object.assign(logicConfig, JSON.parse(this.logicConfigExtra))
        }
        const payload = {
          title: this.title.trim(),
          icon: this.icon.trim(),
          summary: this.summary,
          bodyMarkdown: this.bodyMarkdown,
          hostNotes: this.hostNotes,
          points: Number(this.points) || 0,
          logicType: this.logicType,
          maxAssignees: Math.max(1, Number(this.maxAssignees) || 1),
          logicConfig,
          acceptOpensAt: this.acceptOpensAt.trim() || null,
          acceptClosesAt: this.acceptClosesAt.trim() || null
        }
        if (this.initial && this.status) payload.status = this.status
        this.$emit('submit', payload, null)
      } catch (err) {
        this.$emit('submit', null, err instanceof Error ? err : new Error(String(err)))
      }
    }
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="row">
      <div class="col s12">
        <label>Tytuł</label>
        <input v-model="title" class="browser-default gra-field" required maxlength="200">
        <p class="grey-text" style="margin: 0.25rem 0 0; font-size: 0.85rem">
          Kartka A4, CMR i nagłówek po skanie.
        </p>
      </div>
      <div class="col s12 m6">
        <label>Ikona</label>
        <input v-model="icon" class="browser-default gra-field" list="gra-icon-keys"
          :placeholder="iconKeys.slice(0, 6).join(', ') + '…'">
        <datalist id="gra-icon-keys">
          <option v-for="k in iconKeys" :key="k" :value="k" />
        </datalist>
        <p class="grey-text" style="margin: 0.25rem 0 0; font-size: 0.85rem">
          Material Icons: lista CMR, strona zadania, ikona w środku QR na A4.
        </p>
      </div>
      <div class="col s12 m6">
        <label>Typ</label>
        <select v-model="logicType" class="browser-default gra-field">
          <option v-for="t in types" :key="t" :value="t">{{ logicLabels[t] || t }}</option>
        </select>
      </div>
      <div class="col s12">
        <label>Krótki opis</label>
        <textarea v-model="summary" class="browser-default gra-field gra-field--lg" rows="6" />
        <p class="grey-text" style="margin: 0.25rem 0 0; font-size: 0.85rem">
          Widoczny po zeskanowaniu kodu QR a także w liście w CMR.
        </p>
      </div>
      <div class="col s12">
        <label>Treść (markdown)</label>
        <textarea v-model="bodyMarkdown" class="browser-default gra-field gra-field--xl" rows="16" />
        <p class="grey-text" style="margin: 0.25rem 0 0; font-size: 0.85rem">
          Pełna treść w aplikacji — tylko gdy jest coś ponad krótki opis (mapa, sekret po przyjęciu, placeholdery).
          Zostaw puste, jeśli treść = krótki opis; wtedy gracz widzi tylko opis.
        </p>
      </div>
      <div class="col s12">
        <label>Notatki hosta / przygotowanie</label>
        <textarea v-model="hostNotes" class="browser-default gra-field gra-field--lg" rows="8"
          placeholder="Np. schować flagę, mapa, okulary…" />
        <p class="grey-text" style="margin: 0.25rem 0 0; font-size: 0.85rem">
          Tylko CMR: checklista "Przygotowania" i karta zadania u organizatora. Gracze tego nie widzą.
        </p>
      </div>
      <div class="col s4">
        <label>Punkty</label>
        <input v-model.number="points" type="number" class="browser-default gra-field">
      </div>
      <div class="col s4">
        <label>Max osób</label>
        <input v-model.number="maxAssignees" type="number" min="1" class="browser-default gra-field">
      </div>
      <div v-if="initial" class="col s4">
        <label>Status</label>
        <select v-model="status" class="browser-default gra-field">
          <option value="">(bez zmiany)</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ statusLabels[s] || s }}</option>
        </select>
      </div>
      <div class="col s12 m6">
        <label>Okno przyjęć od (UTC)</label>
        <input v-model="acceptOpensAt" class="browser-default gra-field" placeholder="YYYY-MM-DD HH:MM:SS">
      </div>
      <div class="col s12 m6">
        <label>Okno przyjęć do (UTC)</label>
        <input v-model="acceptClosesAt" class="browser-default gra-field" placeholder="YYYY-MM-DD HH:MM:SS">
      </div>
      <div class="col s12 m6">
        <label>Kiedy widać treść (markdown)</label>
        <select v-model="bodyReveal" class="browser-default gra-field">
          <option v-for="o in bodyReveals" :key="o.value || 'default'" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="col s4">
        <label>Miękki limit (min)</label>
        <input v-model="softMinutes" type="number" min="0" class="browser-default gra-field">
      </div>
      <div class="col s4">
        <label>Start zegara</label>
        <select v-model="timerStart" class="browser-default gra-field">
          <option value="">Domyślnie (manual)</option>
          <option value="manual">Host: Start zegar</option>
          <option value="accept">Przy przyjęciu</option>
        </select>
      </div>
      <div class="col s4">
        <label>Stawka min</label>
        <input v-model="stakeMin" type="number" class="browser-default gra-field">
      </div>
      <div class="col s4">
        <label>Stawka max</label>
        <input v-model="stakeMax" type="number" class="browser-default gra-field">
      </div>
      <div class="col s12 m4">
        <label>Pula ksyw (linie)</label>
        <textarea v-model="nicknamePoolText" class="browser-default gra-field gra-field--lg" rows="6" />
      </div>
      <div class="col s12 m4">
        <label>Pula organizatorów (linie)</label>
        <textarea v-model="organizerPoolText" class="browser-default gra-field gra-field--lg" rows="6" />
      </div>
      <div class="col s12 m4">
        <label>Pula przedmiotów (linie, placeholder item)</label>
        <textarea v-model="itemPoolText" class="browser-default gra-field gra-field--lg" rows="6" />
      </div>
      <div class="col s12">
        <label>Dodatkowa konfiguracja (JSON)</label>
        <textarea v-model="logicConfigExtra" class="browser-default gra-field gra-field--lg" rows="6"
          placeholder="{}" />
      </div>
      <div class="col s12">
        <button type="submit" class="btn-large green waves-effect waves-light" :disabled="loading">
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </form>
</template>
