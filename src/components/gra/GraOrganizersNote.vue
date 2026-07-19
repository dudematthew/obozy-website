<script>
import { loadFestivalSettings, organizersLine } from '@/lib/graFestivalSettings'

export default {
  name: 'GraOrganizersNote',
  data() {
    return {
      settings: null
    }
  },
  computed: {
    line() {
      return organizersLine(this.settings)
    }
  },
  created() {
    loadFestivalSettings().then((s) => {
      this.settings = s
    })
  }
}
</script>

<template>
  <p v-if="line" class="gra-organizers-note">
    Organizatorzy:
    <strong>{{ line }}</strong>.
  </p>
</template>

<style scoped>
.gra-organizers-note {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #1a1a1a;
}

.gra-organizers-note strong {
  color: #0d3d12;
  font-weight: 800;
}
</style>
