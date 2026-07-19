<script>
import intro from '@/data/gra-intro.json'

export default {
  name: 'GraOrganizersNote',
  computed: {
    line() {
      const list = intro.organizers || []
      return list.length ? list.join(', ') : ''
    }
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
