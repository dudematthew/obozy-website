<script>
import intro from '@/data/gra-intro.json'

export default {
  name: 'GraOrganizersNote',
  computed: {
    line () {
      const list = intro.organizers || []
      return list.length ? list.join(', ') : ''
    }
  }
}
</script>

<template>
  <p v-if="line" class="gra-organizers-note">
    Zaliczanie i pytania u organizatorów:
    <strong>{{ line }}</strong>.
    Chodzą po terenie z telefonami.
  </p>
</template>

<style scoped>
.gra-organizers-note {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #455a64;
}

.gra-organizers-note strong {
  color: #2e7d32;
  font-weight: 700;
}
</style>
