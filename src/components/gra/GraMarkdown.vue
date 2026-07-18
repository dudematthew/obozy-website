<script>
import { renderGraMarkdown } from '@/lib/graMarkdown'

export default {
  name: 'GraMarkdown',
  props: {
    source: { type: String, default: '' }
  },
  computed: {
    html () {
      return renderGraMarkdown(this.source)
    }
  }
}
</script>

<template>
  <div class="gra-md" v-html="html" />
</template>
