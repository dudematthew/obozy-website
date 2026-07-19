<script>
import GraShell from '@/components/gra/GraShell.vue'
import GraTaskForm from '@/components/gra/GraTaskForm.vue'
import { hostCreateTask } from '@/api/graHost'
import { getHostMasterKey, getHostToken } from '@/lib/graHostSession'

export default {
  name: 'GraHostNewView',
  components: { GraShell, GraTaskForm },
  data () {
    return { loading: false, error: null }
  },
  created () {
    if (!getHostToken()) {
      this.$router.replace({ name: 'gra-host' })
      return
    }
    if (!getHostMasterKey()) {
      this.$router.replace({ name: 'gra-host' })
    }
  },
  methods: {
    async onSubmit (payload, err) {
      if (err) {
        this.error = err.message || String(err)
        return
      }
      const masterKey = getHostMasterKey()
      if (!masterKey) {
        this.error = 'Najpierw odblokuj klucz master na tablicy CMR.'
        return
      }
      this.loading = true
      this.error = null
      try {
        const task = await hostCreateTask(getHostToken(), payload, masterKey)
        this.$router.replace({ name: 'gra-host-task', params: { id: task.id } })
      } catch (e) {
        this.error = (e && e.message) || 'Nie udało się utworzyć.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <GraShell page-title="Nowe zadanie" show-host-link>
    <div class="gra-page">
      <p><router-link :to="{ name: 'gra-host' }">← Tablica</router-link></p>
      <h4 style="margin-top: 0">Nowe zadanie</h4>
      <div v-if="error" class="card-panel red lighten-4 red-text text-darken-2">{{ error }}</div>
      <div class="card">
        <div class="card-content">
          <GraTaskForm submit-label="Utwórz" :loading="loading" @submit="onSubmit" />
        </div>
      </div>
    </div>
  </GraShell>
</template>
