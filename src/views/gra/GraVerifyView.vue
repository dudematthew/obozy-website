<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraIntroRules from '@/components/gra/GraIntroRules.vue'
import GraOrganizersNote from '@/components/gra/GraOrganizersNote.vue'
import { verifyTask } from '@/api/graTasks'
import { graIconName } from '@/lib/graIcons'
import { logicLabel } from '@/lib/graLabels'

export default {
  name: 'GraVerifyView',
  components: { GraShell, GraIntroRules, GraOrganizersNote },
  data () {
    return { loading: true, error: null, task: null }
  },
  computed: {
    verifyToken () {
      return this.$route.params.verifyToken
    }
  },
  watch: {
    verifyToken: {
      immediate: true,
      handler () {
        this.load()
      }
    }
  },
  methods: {
    graIconName,
    logicLabel,
    async load () {
      this.loading = true
      this.error = null
      try {
        this.task = await verifyTask(this.verifyToken)
      } catch (err) {
        this.task = null
        this.error = (err && err.message) || 'Nie znaleziono zadania.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <GraShell page-title="Potwierdzenie">
    <div class="gra-page">
      <p class="center grey-text" style="line-height: 1.55; max-width: 34em; margin-left: auto; margin-right: auto">
        To jest kod potwierdzenia: pokazuje status zadania bez możliwości przyjęcia.
        Przydatny przy wymianie albo gdy musisz kogoś wtajemniczyć.
      </p>
      <p v-if="loading" class="center grey-text">Sprawdzanie…</p>
      <div v-else-if="error" class="card-panel red lighten-4 red-text text-darken-2">{{ error }}</div>

      <template v-if="task">
        <div class="card">
          <div class="card-content">
            <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.35rem">
              <span class="chip green lighten-4 green-text text-darken-2" style="margin: 0">
                <i class="material-icons" style="font-size: 1rem; vertical-align: middle">{{ graIconName(task.icon) }}</i>
                {{ logicLabel(task.logicType) }}
              </span>
              <span class="chip" style="margin: 0">{{ task.points }} pkt</span>
              <span
                class="chip"
                style="margin: 0"
                :class="task.isAvailable ? 'green lighten-4' : 'red lighten-4'"
              >
                {{ task.isAvailable ? 'Dostępne' : 'Niedostępne' }}
              </span>
            </div>
            <h1 class="gra-task-title">{{ task.title }}</h1>
            <p class="gra-task-summary">{{ task.summary }}</p>
            <GraOrganizersNote />
          </div>
        </div>
        <GraIntroRules collapsible />
      </template>
    </div>
  </GraShell>
</template>
