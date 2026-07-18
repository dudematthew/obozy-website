<script>
export default {
  name: 'GraSoftTimer',
  props: {
    acceptedAt: { type: String, required: true },
    softMinutes: { type: Number, required: true }
  },
  data () {
    return { now: Date.now(), timerId: null }
  },
  computed: {
    remainingMs () {
      const iso = String(this.acceptedAt).replace(' ', 'T') + 'Z'
      const start = Date.parse(iso)
      if (Number.isNaN(start)) return null
      return start + this.softMinutes * 60 * 1000 - this.now
    },
    label () {
      if (this.remainingMs == null) return ''
      if (this.remainingMs <= 0) return 'Czas miękki minął'
      const sec = Math.floor(this.remainingMs / 1000)
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${String(s).padStart(2, '0')}`
    },
    overdue () {
      return this.remainingMs != null && this.remainingMs <= 0
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
    :class="overdue ? 'red lighten-4 red-text text-darken-2' : 'orange lighten-4'"
  >
    <i class="material-icons" style="font-size: 1rem; vertical-align: middle">timer</i>
    {{ label }}
  </span>
</template>
