<script>
import { renderGraMarkdown } from '@/lib/graMarkdown'
import { destroyMaterialbox, initMaterialbox, unlockMaterialboxPageScroll } from '@/lib/materialbox'

export default {
  name: 'GraMarkdown',
  props: {
    source: { type: String, default: '' }
  },
  computed: {
    html () {
      return renderGraMarkdown(this.source)
    }
  },
  mounted () {
    this.scheduleMaterialbox()
  },
  updated () {
    // v-html can replace DOM; re-init like QuizView.updated
    this.scheduleMaterialbox()
  },
  beforeUnmount () {
    destroyMaterialbox(this.$el)
    unlockMaterialboxPageScroll()
  },
  methods: {
    scheduleMaterialbox () {
      this.$nextTick(() => {
        requestAnimationFrame(() => initMaterialbox(this.$el))
      })
    }
  }
}
</script>

<template>
  <div class="gra-md" v-html="html" />
</template>
