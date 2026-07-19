<script>
export default {
  name: 'GraSoftTimer',
  props: {
    /** UTC datetime when the soft clock started; null = waiting for host. */
    startedAt: { type: String, default: null },
    softMinutes: { type: Number, required: true }
  },
  data () {
    return { now: Date.now(), timerId: null }
  },
  computed: {
    waiting () {
      return !this.startedAt
    },
    remainingMs () {
      if (this.waiting) return null
      const iso = String(this.startedAt).replace(' ', 'T') + 'Z'
      const start = Date.parse(iso)
      if (Number.isNaN(start)) return null
      return start + this.softMinutes * 60 * 1000 - this.now
    },
    label () {
      if (this.waiting) return 'Czas jeszcze nie ruszył'
      if (this.remainingMs == null) return ''
      if (this.remainingMs <= 0) return 'Czas miękki minął'
      const sec = Math.floor(this.remainingMs / 1000)
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${String(s).padStart(2, '0')}`
    },
    overdue () {
      return this.remainingMs != null && this.remainingMs <= 0
    },
    chipClass () {
      if (this.waiting) return 'grey lighten-3 grey-text text-darken-2'
      if (this.overdue) return 'red lighten-4 red-text text-darken-2'
      return 'orange lighten-4'
    }
  },
  mounted () {
    this.timerId = setInterval(() => { this.now = Date.now() }, 1000)
  },
  beforeUnmount () {
    if (this.timerId) clearInterval(this.timerId)
  }
}
</script>

<template>
  <span
    v-if="label"
    class="chip"
    :class="chipClass"
  >
    <i class="material-icons" style="font-size: 1rem; vertical-align: middle">timer</i>
    {{ label }}
  </span>
</template>
