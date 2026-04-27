<script>
import 'remark-github-blockquote-alert/alert.css'
import { getManual, manuals as allManuals } from '@/data/manual-ir/registry'
import { updateMetaTags } from '@/lib/metaUtils.js'
import { SnapDeck } from '@/lib/manual-reader/snapDeck'

/* global M */
export default {
  name: 'ManualView',
  data() {
    return {
      loadError: null,
      ir: null,
      activePart: 0,
      activeSlide: 0,
      activeSub: 0,
      subDir: 1,        // last H3 transition direction: +1 forward, -1 back
      subMemory: {},    // { [tileId]: activeSub } — remembers last sub per tile
      subAnimated: false, // false on first entry; true only after explicit navigation
      searchQuery: '',
      searchOpen: false,
      glossOpen: false,
      glossTerm: '',
      glossText: '',
      glossLink: null,
      tagOpen: false,
      tagLabel: '',
      tagDesc: '',
      tagIcon: 'label',
      _routePushPending: false, // guard: don't re-act to our own router.replace
      navOpen: false,
      deck: null,
      _swipe: null
    }
  },
  computed: {
    documentTitle() {
      return this.ir?.meta?.title || 'Instrukcja'
    },
    part() {
      return this.ir?.parts?.[this.activePart] || null
    },
    /** Slides: cover (optional) + each tile + optional finale. Always mirrors slides.length. */
    verticalSlideCount() {
      return this.slides.length
    },
    slides() {
      if (!this.part) return []
      const out = []
      if (this.part.coverHtml) out.push({ kind: 'cover', id: `${this.part.id}-cover` })
        ; (this.part.tiles || []).forEach((t) => out.push({ kind: 'tile', id: t.id, tile: t }))
      // Last-slide cap: finale for the final part, part-end for every other part
      if (this.activePart === this.partsCount - 1) {
        out.push({ kind: 'finale', id: '__finale__' })
      } else {
        out.push({ kind: 'part-end', id: '__part-end__' })
      }
      return out
    },
    nextPart() {
      if (!this.ir || this.activePart >= this.partsCount - 1) return null
      return this.ir.parts[this.activePart + 1] || null
    },
    relatedManuals() {
      if (!this.ir) return []
      const suggestedIds = this.ir.meta?.related
      const all = Object.values(allManuals || {})
      if (suggestedIds && suggestedIds.length) {
        return suggestedIds
          .map((id) => allManuals[id])
          .filter(Boolean)
          .map((m) => ({ id: m.id, title: m.meta?.title || m.id, logoUrl: m.meta?.logoUrl || null }))
      }
      // Default: all other manuals
      return all
        .filter((m) => m.id !== this.ir?.id)
        .map((m) => ({ id: m.id, title: m.meta?.title || m.id, logoUrl: m.meta?.logoUrl || null }))
    },
    current() {
      return this.slides[this.activeSlide] || null
    },
    searchHits() {
      if (!this.searchQuery || !this.ir) return []
      const q = this.searchQuery.toLowerCase().trim()
      if (!q) return []
      const hits = []
      this.ir.parts.forEach((p, pi) => {
        (p.tiles || []).forEach((t, ti) => {
          const title = (t.title || '').toLowerCase()
          if (title.includes(q)) {
            let slide = p.coverHtml ? 1 : 0
            const tileIdx = (p.tiles || []).indexOf(t)
            slide += tileIdx
            hits.push({ label: t.title, part: pi, slide })
            return
          }
          if (t.subsections) {
            t.subsections.forEach((s, si) => {
              if ((s.title || '').toLowerCase().includes(q)) {
                let slide = p.coverHtml ? 1 : 0
                slide += (p.tiles || []).indexOf(t)
                hits.push({ label: `${t.title} → ${s.title}`, part: pi, slide, sub: si })
              }
            })
          }
        })
      })
      return hits.slice(0, 12)
    },
    vProgress() {
      const n = this.verticalSlideCount
      if (n < 2) return 0
      return (this.activeSlide / (n - 1)) * 100
    },
    partsCount() {
      return this.ir?.parts?.length || 0
    },
    canPrevPart() {
      return this.activePart > 0
    },
    canNextPart() {
      return this.activePart < this.partsCount - 1
    },
    canPrevTile() {
      return this.activeSlide > 0 || this.canPrevPart
    },
    canNextTile() {
      const atLastSlide = this.verticalSlideCount > 0 && this.activeSlide >= this.verticalSlideCount - 1
      return (!atLastSlide) || this.canNextPart
    },
    remainingTiles() {
      if (!this.verticalSlideCount) return 0
      return Math.max(0, this.verticalSlideCount - this.activeSlide - 1)
    },
    currentSubs() {
      const c = this.current
      if (!c || c.kind !== 'tile') return []
      return (c.tile && c.tile.subsections) || []
    },
    currentSub() {
      const subs = this.currentSubs
      if (!subs.length) return null
      const i = Math.max(0, Math.min(subs.length - 1, this.activeSub))
      return subs[i]
    },
    canPrevSub() {
      return this.currentSubs.length > 0 && this.activeSub > 0
    },
    canNextSub() {
      return this.currentSubs.length > 0 && this.activeSub < this.currentSubs.length - 1
    },
    dotsGridStyle() {
      return {}
    },
    navTree() {
      if (!this.ir) return []
      const items = []
      this.ir.parts.forEach((p, pi) => {
        items.push({ kind: 'part', label: p.title || `Część ${pi + 1}`, part: pi })
        if (p.coverHtml) {
          items.push({ kind: 'tile', label: 'Strona tytułowa', part: pi, slide: 0 })
        }
        const coverOffset = p.coverHtml ? 1 : 0
        ;(p.tiles || []).forEach((t, ti) => {
          const slide = ti + coverOffset
          items.push({ kind: 'tile', label: t.title || `Sekcja ${ti + 1}`, part: pi, slide })
          ;(t.subsections || []).forEach((s, si) => {
            items.push({ kind: 'sub', label: s.title || `Podsekcja ${si + 1}`, part: pi, slide, sub: si })
          })
        })
      })
      return items
    }
  },
  watch: {
    activePart() {
      this.activeSlide = 0
      this.activeSub = 0
      this.subDir = 1
      this.subAnimated = false
      this.subMemory = {}
      this.$nextTick(() => {
        this.rebuildDeck()
        this.$nextTick(() => this.syncRouteFromSlide())
      })
    },
    activeSlide() {
      const slide = this.slides[this.activeSlide]
      const tileId = slide?.tile?.id
      this.activeSub = (tileId && this.subMemory[tileId] != null) ? this.subMemory[tileId] : 0
      this.subDir = 1
      this.subAnimated = false
      this.syncRouteFromSlide()
    },
    '$route.params.manualId'() {
      this.loadData()
    },
    '$route.params.tileSlug'(newSlug) {
      // Ignore changes we ourselves pushed — only react to external navigation (back/forward)
      if (this._routePushPending) return
      if (newSlug) this.navigateToTileSlug(newSlug)
    }
  },
  mounted() {
    this.loadData()
    window.addEventListener('keydown', this.onGlobalKey)
  },
  beforeUnmount() {
    this.destroyDeck()
    window.removeEventListener('keydown', this.onGlobalKey)
    clearTimeout(this._scrollTimer)
  },
  methods: {
    loadData() {
      this.destroyDeck()
      const id = this.$route.params.manualId
      const data = getManual(id)
      if (!data) {
        this.loadError = 'Nie znaleziono tej instrukcji.'
        this.ir = null
        return
      }
      this.loadError = null
      this.ir = data
      this.activePart = 0
      this.activeSlide = 0
      this.updatePageMeta()
      this.$nextTick(() => {
        this.rebuildDeck()
        const initialSlug = this.$route.params.tileSlug
        if (initialSlug) {
          this.$nextTick(() => this.navigateToTileSlug(initialSlug))
        }
      })
    },
    /**
     * Push the current slide's slug into the URL.
     * Sets a guard flag so the tileSlug watcher doesn't create a navigation loop.
     */
    syncRouteFromSlide() {
      const slide = this.slides[this.activeSlide]
      if (!slide) return
      const slug = slide.kind === 'cover'
        ? `${this.part?.id}-cover`
        : slide.kind === 'finale' ? '__finale__'
        : slide.kind === 'part-end' ? '__part-end__'
        : slide.tile?.id
      if (!slug) return
      if (this.$route.params.tileSlug === slug) return
      this._routePushPending = true
      this.$router.replace({
        name: 'manual',
        params: { manualId: this.$route.params.manualId, tileSlug: slug }
      }).finally(() => { this._routePushPending = false })
    },
    /**
     * Find and navigate to the slide matching a tile slug from the URL.
     */
    navigateToTileSlug(slug) {
      if (!slug || !this.ir) return
      for (let pi = 0; pi < this.ir.parts.length; pi++) {
        const p = this.ir.parts[pi]
        if (slug === `${p.id}-cover` || (pi === 0 && slug === 'cover')) {
          if (this.activePart !== pi) {
            this.activePart = pi
          } else {
            this.activeSlide = 0
          }
          return
        }
        const tiles = p.tiles || []
        for (let ti = 0; ti < tiles.length; ti++) {
          if (tiles[ti].id === slug) {
            const coverOffset = p.coverHtml ? 1 : 0
            if (this.activePart !== pi) {
              this.activePart = pi
              this.$nextTick(() => {
                this.$nextTick(() => { this.activeSlide = ti + coverOffset })
              })
            } else {
              this.activeSlide = ti + coverOffset
            }
            return
          }
        }
      }
    },
    updatePageMeta() {
      if (!this.ir) return
      const t = `${this.documentTitle} | Instrukcja | Obozy - Gra Terenowa`
      const d = this.ir.meta?.description || 'Interaktywna instrukcja gry — Obozy Gra Terenowa'
      document.title = t
      updateMetaTags({ title: t, description: d, image: 'https://obozy.org.pl/og-image.png', imageAlt: t, url: window.location.href })
    },
    destroyDeck() {
      if (this.deck) {
        try { this.deck.unmount() } catch (e) { /* noop */ }
        this.deck = null
      }
    },
    rebuildDeck() {
      this.destroyDeck()
      this.$nextTick(() => {
        const root = this.$refs.deckRoot
        if (!root) return
        this.deck = new SnapDeck({
          getCount: () => this.slides.length,
          getIndex: () => this.activeSlide,
          setIndex: (n) => {
            this.activeSlide = n
            // reset scroll position on slide change
            this.$nextTick(() => {
              const sc = this.$refs.slideScroll
              if (sc) sc.scrollTop = 0
            })
          },
          getScrollEl: () => this.$refs.slideScroll || null
        })
        this.deck.mount(root)
      })
    },
    onContentClick(e) {
      // --- paragraph / inline tag badges ---
      const tagEl = e.target.closest
        ? (e.target.closest('.manual-tag-badge') || e.target.closest('.manual-tag-inline'))
        : null
      if (tagEl) {
        const tagKey = tagEl.dataset && tagEl.dataset.tag
        if (!tagKey) return
        const tags = (this.ir && this.ir.meta && this.ir.meta.tags) || {}
        const tagDef = tags[tagKey]
        if (!tagDef) return
        this.tagLabel = tagDef.label || tagKey
        this.tagDesc = tagDef.description || ''
        this.tagIcon = tagDef.icon || 'label'
        this.tagOpen = true
        return
      }
      // --- glossary terms ---
      const glossEl = e.target.closest ? e.target.closest('.manual-glossary-term') : null
      if (glossEl) {
        const slug = glossEl.dataset && glossEl.dataset.glossary
        if (!slug) return
        const map = (this.ir && this.ir.meta && this.ir.meta.glossary) || {}
        const entry = map[slug]
        // Prefer the explicit display name from meta, fall back to the clicked word
        const display = (entry && typeof entry === 'object' && entry.display) ? entry.display : null
        const label = display || (glossEl.textContent || '').trim() || slug
        this.glossTerm = label
        const def = entry && typeof entry === 'object' ? entry.definition : entry
        this.glossText = (typeof def === 'string' && def) ? def : `Brak definicji w słowniku: ${slug}`
        this.glossLink = (entry && typeof entry === 'object' && entry.link) ? entry.link : null
        this.glossOpen = true
        return
      }
      // --- accordion open: scroll into view if needed ---
      const summaryEl = e.target.closest ? e.target.closest('.manual-accordion__summary') : null
      if (summaryEl) {
        const details = summaryEl.closest('details')
        if (details) {
          // toggle hasn't fired yet — check state on next frame
          requestAnimationFrame(() => {
            if (!details.open) return
            const scrollEl = this.$refs.slideScroll
            if (!scrollEl) return
            const dRect = details.getBoundingClientRect()
            const sRect = scrollEl.getBoundingClientRect()
            // If the top of the accordion scrolled above the visible area, bring it back
            if (dRect.top < sRect.top + 8) {
              const desired = scrollEl.scrollTop + (dRect.top - sRect.top) - 8
              scrollEl.scrollTo({ top: Math.max(0, desired), behavior: 'smooth' })
            }
          })
        }
        return
      }
      // --- in-document reference links ---
      const refEl = e.target.closest ? e.target.closest('.manual-ref-link') : null
      if (refEl) {
        e.preventDefault()
        const href = refEl.getAttribute('href') || ''
        const slug = decodeURIComponent(href.replace(/^#/, ''))
        if (!slug || !this.ir) return
        const entry = this.ir.linkIndex && this.ir.linkIndex[slug]
        if (!entry) return
        const targetPart = entry.part ?? 0
        const targetSlide = (entry.tile ?? 0) + ((this.ir.parts[targetPart]?.coverHtml) ? 1 : 0)
        this.activePart = targetPart
        this.$nextTick(() => {
          this.activeSlide = targetSlide
          if (entry.subsection != null) {
            this.$nextTick(() => this.goToSub(entry.subsection))
          }
        })
      }
    },
    jumpToGlossLink() {
      const slug = this.glossLink
      if (!slug || !this.ir) return
      this.glossOpen = false
      const entry = this.ir.linkIndex && this.ir.linkIndex[slug]
      if (!entry) return
      const targetPart = entry.part ?? 0
      const coverOffset = this.ir.parts[targetPart]?.coverHtml ? 1 : 0
      const targetSlide = (entry.tile ?? 0) + coverOffset
      this.activePart = targetPart
      this.$nextTick(() => {
        this.activeSlide = targetSlide
        if (entry.subsection != null) {
          this.$nextTick(() => this.goToSub(entry.subsection))
        }
      })
    },
    openSearch() {
      this.searchOpen = true
      this.$nextTick(() => {
        const i = this.$el.querySelector('#manual-search')
        if (i) i.focus()
      })
    },
    openTagModal(tagKey) {
      const tags = (this.ir && this.ir.meta && this.ir.meta.tags) || {}
      const tagDef = tags[tagKey]
      if (!tagDef) return
      this.tagLabel = tagDef.label || tagKey
      this.tagDesc = tagDef.description || ''
      this.tagIcon = tagDef.icon || 'label'
      this.tagOpen = true
    },
    navJump(item) {
      this.navOpen = false
      if (item.kind === 'part') {
        this.activePart = item.part
        return
      }
      this.activePart = item.part
      this.$nextTick(() => {
        this.rebuildDeck()
        this.$nextTick(() => {
          this.activeSlide = item.slide
          if (item.sub != null) {
            this.$nextTick(() => this.goToSub(item.sub))
          }
        })
      })
    },
    jumpTo(hit) {
      this.searchQuery = ''
      this.searchOpen = false
      this.activePart = hit.part
      this.$nextTick(() => {
        this.rebuildDeck()
        this.$nextTick(() => {
          this.activeSlide = hit.slide
          if (hit.sub != null) {
            this.$nextTick(() => this.goToSub(hit.sub))
          }
        })
      })
    },
    /** For users without a mouse wheel. Handles cross-part navigation:
     *  pressing ▲ on the first slide of a part goes to the last slide of the
     *  previous part, and ▼ on the last slide advances to the next part. */
    stepTile(dir) {
      const atFirst = this.activeSlide === 0
      const atLast = this.activeSlide >= this.verticalSlideCount - 1
      if (dir < 0 && atFirst && this.canPrevPart) {
        this.activePart -= 1
        this.$nextTick(() => {
          this.activeSlide = this.verticalSlideCount - 1
        })
        return
      }
      if (dir > 0 && atLast && this.canNextPart) {
        this.activePart += 1
        return
      }
      if (this.deck) {
        this.deck.nudge(dir)
        return
      }
      const n = this.slides.length
      if (n < 1) return
      const next = this.activeSlide + dir
      if (next < 0 || next >= n) return
      this.activeSlide = next
      this.$nextTick(() => {
        const sc = this.$refs.slideScroll
        if (sc) sc.scrollTop = 0
      })
    },
    /** Subsection navigation (H3). Tracks direction for the slide animation
     *  and aligns the new sub-card's top with the viewport so the user lands
     *  at the start of the new subsection — without scrolling all the way back
     *  up to the H2 title.
     *
     *  Why setTimeout(200) and not $nextTick + rAF:
     *  <Transition mode="out-in"> leaves the OLD article in DOM for its full
     *  leave duration (180ms) before mounting the new one. At $nextTick the
     *  old article is still animating; measuring it gives a stale / wrong
     *  position. 200ms (180ms transition + 20ms budget) guarantees the new
     *  article is mounted and laid out before we read its geometry.
     */
    goToSub(i) {
      const subs = this.currentSubs
      if (!subs.length) return
      const next = Math.max(0, Math.min(subs.length - 1, i))
      if (next === this.activeSub) return
      this.subDir = next > this.activeSub ? 1 : -1
      this.activeSub = next
      this.subAnimated = true
      const tileId = this.current?.tile?.id
      if (tileId) this.subMemory = { ...this.subMemory, [tileId]: next }
      clearTimeout(this._scrollTimer)
      this._scrollTimer = setTimeout(this.scrollToActiveSubTop, 200)
    },
    /**
     * Scrolls the slide-scroll container so the active H3 card sits
     * SUB_TOP_OFFSET pixels below the visible top edge of the scroll viewport.
     *
     * Why bounding rects + scrollTop arithmetic (and NOT element.offsetTop):
     *   .manual-h3-card's offsetParent is whatever the closest positioned
     *   ancestor happens to be — currently .manual-reader__stage. That makes
     *   `article.offsetTop` stage-relative, while scrollEl.scrollTo expects
     *   slide-scroll-relative coordinates. The two numbers happen to line up
     *   in today's layout (manual-slide adds zero offset), but any future
     *   `position`, `padding`, or `border` change on an ancestor silently
     *   breaks that. Bounding-rect math is layout-agnostic:
     *     newScrollTop = currentScrollTop + (article.top - scrollEl.top) - offset
     *   reads as "shift the scroll so the article moves from where it is now
     *   to `offset` pixels below the scroll viewport's top edge".
     *
     * Why this is safe during <Transition mode="out-in">:
     *   At $nextTick we measure the OLD article (it's still in DOM with
     *   leave-from + leave-active classes; leave-to with the translateX is
     *   applied on the next animation frame, not yet). The OLD and NEW
     *   articles share the same DOM slot, so the OLD's vertical bounding
     *   rect equals where the NEW will land. translateX doesn't perturb
     *   the y axis even after leave-to fires.
     *
     * Bulletproofing:
     *   - clamp to [0, scrollHeight - clientHeight] so we never request a
     *     scroll position that will be silently truncated to a different
     *     value by the browser (which would also cancel a queued smooth
     *     scroll mid-flight).
     *   - honor prefers-reduced-motion by switching to instant scroll.
     *   - run inside requestAnimationFrame so layout reflects the just-
     *     committed Vue update even when the browser hasn't painted yet
     *     (DevTools throttling, slow CPU, complex tile content).
     */
    /**
     * Scroll so the H3 card's top edge aligns with the scroll container's
     * top edge.  Tune SUB_TOP_OFFSET_PX (pixels below the top edge) to taste
     * — 0 = flush, 8 = a little breathing room.
     *
     * Called after a 200ms delay from goToSub so the Transition out-in has
     * finished and the NEW article is fully mounted.
     */
    scrollToActiveSubTop() {
      const scrollEl = this.$refs.slideScroll
      if (!scrollEl) return
      const SUB_TOP_OFFSET_PX = 8
      const reduce = !!(window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      const article = scrollEl.querySelector('.manual-h3-card')
      if (!article) return
      const aRect = article.getBoundingClientRect()
      const sRect = scrollEl.getBoundingClientRect()
      const desired = scrollEl.scrollTop + (aRect.top - sRect.top) - SUB_TOP_OFFSET_PX
      const max = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
      const target = Math.min(max, Math.max(0, Math.round(desired)))
      if (Math.abs(target - scrollEl.scrollTop) < 1) return
      scrollEl.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
    },
    stepSub(dir) {
      this.goToSub(this.activeSub + dir)
    },
    /**
     * Horizontal swipe detection. Only triggers when:
     * - single-finger gesture
     * - horizontal-dominant (|dx| > |dy|)
     * - decisive (|dx| >= 50px) and not too slow (<700ms)
     * Vertical-dominant swipes pass through to SnapDeck.
     */
    onSwipeStart(e) {
      if (!e.touches || e.touches.length !== 1) {
        this._swipe = null
        return
      }
      const t = e.touches[0]
      this._swipe = { x0: t.clientX, y0: t.clientY, t0: Date.now() }
    },
    onSwipeEnd(e) {
      if (!this._swipe) return
      const s = this._swipe
      this._swipe = null
      const ce = e.changedTouches && e.changedTouches[0]
      if (!ce) return
      const dx = ce.clientX - s.x0
      const dy = ce.clientY - s.y0
      const dt = Date.now() - s.t0
      if (Math.abs(dx) <= Math.abs(dy)) return
      if (Math.abs(dx) < 50) return
      if (dt > 700) return
      if (!this.currentSubs.length) return
      this.stepSub(dx < 0 ? +1 : -1)
    },
    onSwipeCancel() {
      this._swipe = null
    },
    /** Progress bar drag/click: converts pointer position to slide index. */
    onProgressDown(e) {
      e.preventDefault()
      const bar = this.$refs.progressBar
      if (!bar) return
      this._jumpToSlideByY(e.clientY, bar)
      const onMove = (ev) => {
        this._jumpToSlideByY(ev.clientY, bar)
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    _jumpToSlideByY(clientY, bar) {
      const rect = bar.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      const idx = Math.round(ratio * (this.verticalSlideCount - 1))
      if (idx !== this.activeSlide) {
        this.activeSlide = idx
        this.$nextTick(() => {
          const sc = this.$refs.slideScroll
          if (sc) sc.scrollTop = 0
        })
      }
    },
    /** Global keyboard: ←/→ navigate H3 inside a tile (↑/↓ are SnapDeck's). */
    onGlobalKey(e) {
      if (this.searchOpen || this.glossOpen) return
      const t = e.target
      const tag = (t && t.tagName ? t.tagName.toLowerCase() : '')
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (t && t.isContentEditable) return
      if (!this.currentSubs.length) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        this.stepSub(+1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        this.stepSub(-1)
      }
    }
  }
}
</script>

<template>
  <div v-if="loadError" class="container section center">
    <h4>{{ loadError }}</h4>
    <router-link to="/" class="btn green">Strona główna</router-link>
  </div>
  <div v-else-if="ir" class="manual-reader">
    <div class="manual-reader-nav">
      <div class="manual-reader-nav__zone manual-reader-nav__zone--left">
        <router-link
          to="/"
          class="brand-logo manual-reader-nav__brand"
          aria-label="Powrót na stronę Obozy"
        >
          OBOZY
        </router-link>
      </div>
      <div class="manual-reader-nav__zone manual-reader-nav__zone--center">
        <img
          v-if="ir.meta.logoUrl"
          :src="ir.meta.logoUrl"
          class="manual-reader-nav__logo"
          width="32"
          height="32"
          alt=""
        />
        <i v-else class="material-icons manual-reader-nav__logo manual-reader-nav__logo--fallback" aria-hidden="true">menu_book</i>
        <div class="manual-reader-nav__heading">
          <span class="manual-reader-nav__eyebrow">Instrukcja</span>
          <span class="manual-reader-nav__title">{{ documentTitle }}</span>
        </div>
      </div>
      <div class="manual-reader-nav__zone manual-reader-nav__zone--right">
        <button class="btn-flat manual-reader-nav__icon" @click="openSearch" aria-label="Szukaj">
          <i class="material-icons">search</i>
        </button>
        <button
          class="btn-flat manual-reader-nav__icon"
          @click="navOpen = true"
          aria-label="Spis treści"
        >
          <i class="material-icons">toc</i>
        </button>
        <router-link to="/instrukcja" class="btn-flat manual-reader-nav__icon" aria-label="Lista instrukcji">
          <i class="material-icons">menu_book</i>
        </router-link>
      </div>
    </div>

    <div v-if="part" class="manual-reader__stage" ref="deckRoot">
      <div
        v-if="verticalSlideCount > 1"
        ref="progressBar"
        class="manual-reader__progress"
        :aria-label="`Postęp czytania, ekran ${activeSlide + 1} z ${verticalSlideCount}`"
        role="slider"
        :aria-valuenow="activeSlide"
        :aria-valuemin="0"
        :aria-valuemax="verticalSlideCount - 1"
        @pointerdown="onProgressDown"
      >
        <div class="manual-reader__progress-track" aria-hidden="true" />
        <div class="manual-reader__progress-fill" :style="{ height: vProgress + '%' }" aria-hidden="true" />
        <div class="manual-reader__progress-thumb" :style="{ top: vProgress + '%' }">
          <i v-if="current && current.kind === 'finale'" class="material-icons" aria-hidden="true">check</i>
          <i v-else-if="current && current.kind === 'part-end'" class="material-icons" aria-hidden="true">arrow_forward</i>
          <span v-else>{{ remainingTiles }}</span>
        </div>
      </div>

      <div class="manual-slide">
        <div ref="slideScroll" class="manual-slide__scroll"
          :class="{ 'cover-tile': current && current.kind === 'cover', 'has-subs': currentSubs.length > 0 }"
          @click="onContentClick"
          @touchstart.passive="onSwipeStart"
          @touchend.passive="onSwipeEnd"
          @touchcancel.passive="onSwipeCancel">
          <template v-if="current && current.kind === 'cover'">
            <div class="manual-cover">
              <h1 class="manual-cover__title">{{ part.title || documentTitle }}</h1>
              <img
                v-if="ir.meta.logoUrl"
                class="manual-cover__logo"
                :src="ir.meta.logoUrl"
                :alt="part.title || documentTitle"
              />
              <i
                v-else
                class="material-icons manual-cover__logo manual-cover__logo--fallback"
                aria-hidden="true"
              >menu_book</i>
              <div v-if="part.coverHtml" class="manual-cover__body manual-body" v-html="part.coverHtml" />
              <div class="manual-cover__hint" aria-hidden="true">
                <!-- touch devices -->
                <span class="manual-cover__hint--touch">
                  <i class="material-icons">swipe_down</i>
                  <span>przeciągnij w dół, by zacząć</span>
                </span>
                <!-- mouse / keyboard -->
                <span class="manual-cover__hint--mouse">
                  <i class="material-icons">keyboard_arrow_down</i>
                  <span>przewiń w dół, by zacząć</span>
                </span>
              </div>
            </div>
          </template>
          <template v-else-if="current && current.kind === 'finale'">
            <div class="manual-finale">
              <i class="material-icons manual-finale__icon" aria-hidden="true">check_circle</i>
              <h2 class="manual-finale__title">Koniec instrukcji!</h2>
              <p class="manual-finale__sub">Znasz już zasady. Czas na grę.</p>
              <div v-if="relatedManuals.length" class="manual-finale__related">
                <p class="manual-finale__related-label">Inne instrukcje</p>
                <router-link
                  v-for="m in relatedManuals"
                  :key="m.id"
                  :to="`/instrukcja/${m.id}`"
                  class="manual-finale__related-card"
                >
                  <img v-if="m.logoUrl" :src="m.logoUrl" class="manual-finale__related-logo" width="36" height="36" alt="" />
                  <i v-else class="material-icons manual-finale__related-logo--fallback" aria-hidden="true">menu_book</i>
                  <span>{{ m.title }}</span>
                  <i class="material-icons" aria-hidden="true">chevron_right</i>
                </router-link>
              </div>
            </div>
          </template>
          <template v-else-if="current && current.kind === 'part-end'">
            <div class="manual-part-end">
              <i class="material-icons manual-part-end__icon" aria-hidden="true">flag</i>
              <p class="manual-part-end__label">Część {{ activePart + 1 }} z {{ partsCount }}</p>
              <h2 class="manual-part-end__title">{{ part.title }}</h2>
              <p class="manual-part-end__sub">Ukończono tę część. Możesz przejść dalej.</p>
              <button class="manual-part-end__cta" @click="stepTile(1)">
                <span class="manual-part-end__cta-label">Następna część</span>
                <span class="manual-part-end__cta-title">{{ nextPart && nextPart.title }}</span>
                <i class="material-icons" aria-hidden="true">arrow_forward</i>
              </button>
              <div v-if="relatedManuals.length" class="manual-part-end__related">
                <p class="manual-part-end__related-label">Inne instrukcje</p>
                <router-link
                  v-for="m in relatedManuals"
                  :key="m.id"
                  :to="`/instrukcja/${m.id}`"
                  class="manual-finale__related-card"
                >
                  <img v-if="m.logoUrl" :src="m.logoUrl" class="manual-finale__related-logo" width="36" height="36" alt="" />
                  <i v-else class="material-icons manual-finale__related-logo--fallback" aria-hidden="true">menu_book</i>
                  <span>{{ m.title }}</span>
                  <i class="material-icons" aria-hidden="true">chevron_right</i>
                </router-link>
              </div>
            </div>
          </template>
          <template v-else-if="current && current.kind === 'tile'">
            <h2 class="manual-tile__h2">
              {{ current.tile.title }}
              <span
                v-if="current.tile.tagKey && ir.meta.tags && ir.meta.tags[current.tile.tagKey]"
                class="manual-tag-badge"
                role="button"
                tabindex="0"
                @click.stop="openTagModal(current.tile.tagKey)"
              >
                <i class="material-icons manual-tag-badge__icon" aria-hidden="true">{{ ir.meta.tags[current.tile.tagKey].icon }}</i>
                <span v-if="ir.meta.tags[current.tile.tagKey].label" class="manual-tag-badge__label">{{ ir.meta.tags[current.tile.tagKey].label }}</span>
              </span>
            </h2>
            <div v-if="current.tile.introHtml" v-html="current.tile.introHtml" class="manual-body" />
            <div v-if="current.tile.contentHtml" v-html="current.tile.contentHtml" class="manual-body" />
            <div v-else class="manual-h3-wrap">
              <span
                v-if="currentSubs.length > 1"
                class="manual-h3-edge manual-h3-edge--prev"
                :class="{ 'is-hidden': !canPrevSub }"
                aria-hidden="true"
              ><i class="material-icons">chevron_left</i></span>
              <Transition :name="subAnimated ? (subDir > 0 ? 'h3-next' : 'h3-prev') : ''" mode="out-in">
                <article v-if="currentSub" :key="currentSub.id" class="manual-h3-card">
                  <h3 class="manual-tile__h3">
                    {{ currentSub.title }}
                    <span
                      v-if="currentSub.tagKey && ir.meta.tags && ir.meta.tags[currentSub.tagKey]"
                      class="manual-tag-badge"
                      role="button"
                      tabindex="0"
                      @click.stop="openTagModal(currentSub.tagKey)"
                    >
                      <i class="material-icons manual-tag-badge__icon" aria-hidden="true">{{ ir.meta.tags[currentSub.tagKey].icon }}</i>
                      <span v-if="ir.meta.tags[currentSub.tagKey].label" class="manual-tag-badge__label">{{ ir.meta.tags[currentSub.tagKey].label }}</span>
                    </span>
                  </h3>
                  <div v-html="currentSub.html" class="manual-body" />
                </article>
              </Transition>
              <span
                v-if="currentSubs.length > 1"
                class="manual-h3-edge manual-h3-edge--next"
                :class="{ 'is-hidden': !canNextSub }"
                aria-hidden="true"
              ><i class="material-icons">chevron_right</i></span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="manual-reader-foot" role="navigation" aria-label="Nawigacja czytnika">
      <button
        type="button"
        class="manual-foot-btn"
        :disabled="!canPrevTile"
        aria-label="Poprzedni ekran"
        @click="stepTile(-1)"
      >
        <i class="material-icons">expand_less</i>
      </button>
      <div class="manual-foot-center">
        <button
          v-if="currentSubs.length > 0"
          type="button"
          class="manual-foot-btn manual-foot-btn--sub"
          :disabled="!canPrevSub"
          aria-label="Poprzednia podsekcja"
          @click="stepSub(-1)"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        <div
          v-if="currentSubs.length && currentSubs.length <= 14"
          class="manual-foot-dots"
          :style="dotsGridStyle"
          role="tablist"
          aria-label="Podsekcje"
        >
          <button
            v-for="(sub, i) in currentSubs"
            :key="sub.id"
            type="button"
            class="manual-foot-dot"
            :class="{ 'is-active': i === activeSub }"
            :aria-label="sub.title"
            :aria-selected="i === activeSub"
            @click="goToSub(i)"
          />
        </div>
        <div
          v-else-if="currentSubs.length > 14"
          class="manual-foot-counter"
          aria-live="polite"
        >
          <span class="manual-foot-counter__num">{{ activeSub + 1 }}</span>
          <span class="manual-foot-counter__sep">/</span>
          <span class="manual-foot-counter__total">{{ currentSubs.length }}</span>
        </div>
        <button
          v-if="currentSubs.length > 0"
          type="button"
          class="manual-foot-btn manual-foot-btn--sub"
          :disabled="!canNextSub"
          aria-label="Następna podsekcja"
          @click="stepSub(1)"
        >
          <i class="material-icons">chevron_right</i>
        </button>
      </div>
      <button
        type="button"
        class="manual-foot-btn"
        :disabled="!canNextTile"
        aria-label="Następny ekran"
        @click="stepTile(1)"
      >
        <i class="material-icons">expand_more</i>
      </button>
    </div>

    <div v-show="searchOpen" class="manual-overlay" @click.self="searchOpen = false">
      <div class="card manual-overlay__card">
        <div class="card-content">
          <div class="manual-overlay__head">
            <span class="card-title" style="font-size: 1.1rem; margin: 0">Szukaj</span>
            <a href="#" class="green-text" @click.prevent="searchOpen = false">Zamknij</a>
          </div>
          <div class="input-field" style="margin: 0.25rem 0 0">
            <i class="material-icons prefix" style="color: #9e9e9e">search</i>
            <input v-model="searchQuery" id="manual-search" type="search" placeholder="Szukaj po tytułach sekcji…" />
          </div>
          <div v-if="searchHits.length" class="manual-overlay__results">
            <a v-for="(h, i) in searchHits" :key="i" href="#" class="manual-search-hit" @click.prevent="jumpTo(h)">
              <i class="material-icons">north_east</i>
              <span>{{ h.label }}</span>
            </a>
          </div>
          <div v-else class="grey-text" style="margin-top: 0.75rem">
            Wpisz nazwę sekcji, np. „Klasy”.
          </div>
        </div>
      </div>
    </div>

    <div
      v-show="glossOpen"
      class="manual-gloss-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="glossTerm ? `Słownik: ${glossTerm}` : 'Słownik'"
      @click.self="glossOpen = false"
    >
      <div class="manual-gloss-card">
        <div class="manual-gloss-top">
          <div class="manual-gloss-heading">
            <span class="manual-gloss-label">
              <i class="material-icons" aria-hidden="true">lightbulb</i>
              Definicja
            </span>
            <span class="manual-gloss-term">{{ glossTerm }}</span>
          </div>
          <button
            type="button"
            class="manual-gloss-close"
            aria-label="Zamknij słownik"
            @click="glossOpen = false"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
        <p class="manual-gloss-text">{{ glossText }}</p>
        <button
          v-if="glossLink"
          type="button"
          class="manual-gloss-jump"
          @click="jumpToGlossLink"
        >
          <i class="material-icons">north_east</i>
          Przejdź do sekcji
        </button>
      </div>
    </div>

    <div
      v-show="tagOpen"
      class="manual-gloss-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="tagLabel || 'Informacja'"
      @click.self="tagOpen = false"
    >
      <div class="manual-gloss-card manual-tag-card">
        <div class="manual-gloss-top">
          <div class="manual-gloss-heading">
            <span class="manual-gloss-label manual-tag-card__label">
              <i class="material-icons" aria-hidden="true">{{ tagIcon }}</i>
              {{ tagLabel }}
            </span>
          </div>
          <button
            type="button"
            class="manual-gloss-close"
            aria-label="Zamknij"
            @click="tagOpen = false"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
        <p class="manual-gloss-text">{{ tagDesc }}</p>
      </div>
    </div>

    <!-- Navigation drawer (bottom sheet) -->
    <Teleport to="body">
      <div
        v-show="navOpen"
        class="manual-nav-drawer-backdrop"
        @click.self="navOpen = false"
      >
        <div class="manual-nav-drawer" role="dialog" aria-modal="true" aria-label="Spis treści">
          <div class="manual-nav-drawer__header">
            <span class="manual-nav-drawer__title">Spis treści</span>
            <button type="button" class="manual-nav-drawer__close btn-flat" aria-label="Zamknij" @click="navOpen = false">
              <i class="material-icons">close</i>
            </button>
          </div>
          <div class="manual-nav-drawer__body">
            <template v-for="(item, idx) in navTree" :key="idx">
              <div
                v-if="item.kind === 'part'"
                class="manual-nav-item manual-nav-item--part"
              >
                <i class="material-icons manual-nav-item__icon" aria-hidden="true">bookmark</i>
                {{ item.label }}
              </div>
              <button
                v-else-if="item.kind === 'tile'"
                type="button"
                class="manual-nav-item manual-nav-item--tile"
                :class="{ 'is-active': activePart === item.part && activeSlide === item.slide }"
                @click="navJump(item)"
              >
                <i class="material-icons manual-nav-item__icon" aria-hidden="true">article</i>
                {{ item.label }}
              </button>
              <button
                v-else-if="item.kind === 'sub'"
                type="button"
                class="manual-nav-item manual-nav-item--sub"
                :class="{ 'is-active': activePart === item.part && activeSlide === item.slide && activeSub === item.sub }"
                @click="navJump(item)"
              >
                <i class="material-icons manual-nav-item__icon" aria-hidden="true">subdirectory_arrow_right</i>
                {{ item.label }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <div v-else class="container section center">
    <div class="preloader-wrapper active">
      <div class="spinner-layer spinner-green-only">
        <div class="left circle-clipper">
          <div class="circle" />
        </div>
        <div class="gap-patch">
          <div class="circle" />
        </div>
        <div class="right circle-clipper">
          <div class="circle" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$reader-green: #4CAF50;
$reader-green-dark: #2e7d32;
$reader-green-darker: #1b5e20;
$reader-bg: #eceff1;
$reader-text: rgba(0, 0, 0, 0.87);
$reader-nav-h: 56px;
$reader-foot-h: 60px;
$reader-font: 'Lato', sans-serif;

.manual-reader {
  height: 100dvh;
  position: relative;
  background: $reader-bg;
  padding-top: $reader-nav-h;
  padding-bottom: $reader-foot-h;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 3-zone navbar: brand left, guide title centered, controls right.
   Grid (1fr auto 1fr) keeps the centre column visually centred regardless of
   side widths; min-width: 0 lets long titles ellipsize instead of pushing edges. */
.manual-reader-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $reader-nav-h;
  z-index: 1200;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

.manual-reader-nav__zone {
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 0;
}

.manual-reader-nav__zone--left {
  justify-content: flex-start;
}

.manual-reader-nav__zone--center {
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.manual-reader-nav__zone--right {
  justify-content: flex-end;
  gap: 2px;
}

/* Match Header.vue: plain Materialize .brand-logo (#444, M PLUS Rounded 1c),
   but neutralise the absolute / mobile-centring behaviour so it stays inline-left. */
.manual-reader-nav__brand.brand-logo {
  position: static;
  left: auto;
  right: auto;
  transform: none;
  float: none;
  padding: 0;
  margin: 0;
  text-decoration: none;
  color: #444;
  font-size: 1.6rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

@media only screen and (max-width: 992px) {
  .manual-reader-nav__brand.brand-logo {
    left: auto;
    transform: none;
  }
}

.manual-reader-nav__logo {
  flex: 0 0 auto;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.manual-reader-nav__logo--fallback {
  font-size: 28px;
  color: $reader-green-dark;
  background: rgba(76, 175, 80, 0.1);
}

.manual-reader-nav__heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  line-height: 1;
  gap: 2px;
}

.manual-reader-nav__eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $reader-green-dark;
  font-weight: 700;
  line-height: 1;
}

.manual-reader-nav__title {
  font-family: $reader-font;
  font-weight: 700;
  color: #263238;
  font-size: 0.95rem;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
}

.manual-reader-nav__icon {
  padding: 0 8px;
  color: #37474f;
}

.manual-part-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 4px;
}

.manual-part-dot {
  appearance: none;
  border: 0;
  background: rgba(0, 0, 0, 0.15);
  width: 7px;
  height: 7px;
  border-radius: 999px;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, transform 0.15s ease;
}

.manual-part-dot.is-active {
  background: $reader-green-dark;
  transform: scale(1.35);
}

.manual-reader-nav__icon .material-icons {
  color: $reader-green-dark;
}

/* Tight phones: drop the OBOZY brand so the centred title gets the spotlight.
   Grid auto-recentres because zone--left collapses to 0 width. */
@media (max-width: 480px) {
  .manual-reader-nav {
    padding: 0 8px;
    gap: 8px;
  }
  .manual-reader-nav__brand.brand-logo {
    font-size: 1.3rem;
  }
}

.manual-reader__stage {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px;
  width: 100%;
}

/* Vertical progress bar — moved to the LEFT side so it doesn't conflict with
   the browser's native scrollbar on the right. pointer-events: auto makes it
   draggable; cursor: ns-resize signals vertical drag affordance. */
.manual-reader__progress {
  position: absolute;
  /* -4px = tile left edge (8px) minus half bar width (12px), so the bar straddles
     the tile border: half in the gutter, half inside the tile. */
  left: -4px;
  /* 20px inset keeps the thumb circle from overflowing the tile corners */
  top: 20px;
  bottom: 20px;
  width: 28px;
  z-index: 2;
  pointer-events: auto;
  cursor: pointer;
  touch-action: none;
  border-radius: 8px 0 0 8px;
}

.manual-reader__progress-track {
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 2px;
}

.manual-reader__progress-fill {
  position: absolute;
  left: 10px;
  top: 0;
  width: 4px;
  background: $reader-green;
  border-radius: 2px;
  transition: height 0.25s ease;
}

.manual-reader__progress-thumb {
  position: absolute;
  left: 0;
  width: 28px;
  height: 28px;
  background: $reader-green;
  border: 2px solid #ffffff;
  border-radius: 999px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transform: translateY(-50%);
  transition: top 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.manual-reader__progress-thumb .material-icons {
  font-size: 14px;
  color: #ffffff;
}

.manual-slide {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.manual-slide__scroll {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 1.25rem 1.25rem 1.5rem 2rem;
  background: #fff;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-family: $reader-font;
  font-size: 16px;
  line-height: 1.5;
  color: $reader-text;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

/* Cover tile: plain white — no gradient, clean book-cover look. */
.cover-tile {
  background: #ffffff;
}

.manual-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100%;
  padding: 2rem 0 1rem;
  gap: 1.25rem;
  position: relative;
}

/* Logo sits between the title and body text. drop-shadow follows the
   alpha channel of the image, so transparent-background icons don't
   get a box-shaped halo — the shadow "drips" from the icon content only. */
.manual-cover__logo {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0;
  filter: drop-shadow(0 6px 16px rgba(46, 125, 50, 0.28))
          drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12));
}

.manual-cover__logo--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $reader-green-dark;
  font-size: 96px;
  filter: drop-shadow(0 4px 10px rgba(46, 125, 50, 0.22));
}

.manual-cover__title {
  font-family: $reader-font;
  font-size: clamp(1.85rem, 5.5vw + 0.6rem, 2.4rem);
  font-weight: 900;
  line-height: 1.15;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.manual-cover__body {
  max-width: 32ch;
  margin: 0 auto;
}

.manual-cover__body :deep(p) {
  text-align: center;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.manual-cover__body :deep(> p:first-of-type) {
  font-size: 0.78rem;
  font-weight: 700;
  font-style: normal;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $reader-green-darker;
  margin: 0 0 0.5rem;
}

.manual-cover__body :deep(> p:first-of-type em),
.manual-cover__body :deep(> p:first-of-type strong) {
  font-style: normal;
  font-weight: 700;
}

/* "Swipe down to start" UX hint — sits at the bottom of the cover,
   pulses gently to draw attention without being distracting. */
.manual-cover__hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(0, 0, 0, 0.55);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: auto;
  padding-top: 1rem;
  animation: hint-pulse 2.4s ease-in-out infinite;
}

.manual-cover__hint--touch,
.manual-cover__hint--mouse {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Show touch variant on coarse-pointer devices (phones/tablets),
   mouse variant on fine-pointer devices (desktop). */
.manual-cover__hint--mouse { display: none; }
@media (hover: hover) and (pointer: fine) {
  .manual-cover__hint--touch { display: none; }
  .manual-cover__hint--mouse { display: flex; }
}

.manual-cover__hint .material-icons {
  font-size: 22px;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.55; transform: translateY(0); }
  50%       { opacity: 1;    transform: translateY(5px); }
}

/* End-of-guide completion screen */
.manual-finale {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100%;
  padding: 2rem 1rem;
  gap: 1rem;
}

.manual-finale__icon {
  font-size: 64px;
  color: $reader-green;
}

.manual-finale__title {
  font-family: $reader-font;
  font-size: 1.6rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
}

.manual-finale__sub {
  color: rgba(0, 0, 0, 0.65);
  font-size: 1rem;
  margin: 0 0 0.5rem;
}

.manual-finale__related {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0.5rem;
}

.manual-finale__related-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.55);
  margin: 0 0 4px;
}

.manual-finale__related-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  text-decoration: none;
  color: #263238;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.manual-finale__related-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.manual-finale__related-card span {
  flex: 1 1 auto;
  text-align: left;
}

.manual-finale__related-logo {
  flex: 0 0 36px;
  border-radius: 6px;
  object-fit: contain;
}

.manual-finale__related-logo--fallback {
  flex: 0 0 auto;
  font-size: 28px;
  color: $reader-green-dark;
}

/* Chapter-end transition screen — shown at the end of every non-last part */
.manual-part-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  height: 100%;
  gap: 0.5rem;
}

.manual-part-end__icon {
  font-size: 4rem;
  color: $reader-green;
  margin-bottom: 0.5rem;
}

.manual-part-end__label {
  font-family: $reader-font;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $reader-green-dark;
}

.manual-part-end__title {
  font-family: $reader-font;
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0.1rem 0 0.4rem;
  line-height: 1.2;
}

.manual-part-end__sub {
  font-family: $reader-font;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 1.5rem;
}

.manual-part-end__cta {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: $reader-green-dark;
  border: 2px solid $reader-green;
  border-radius: 12px;
  padding: 13px 20px;
  cursor: pointer;
  text-align: left;
  max-width: 320px;
  width: 100%;
  transition: background 0.15s ease, transform 0.1s ease;

  .material-icons {
    flex: 0 0 auto;
    margin-left: auto;
    color: $reader-green;
  }

  &:hover {
    background: rgba(76, 175, 80, 0.06);
  }

  &:active {
    background: rgba(76, 175, 80, 0.12);
    transform: scale(0.98);
  }
}

.manual-part-end__cta-label {
  font-family: $reader-font;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.6);
  display: block;
}

.manual-part-end__cta-title {
  font-family: $reader-font;
  font-size: 1rem;
  font-weight: 700;
  display: block;
  line-height: 1.3;
}

.manual-part-end__related {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manual-part-end__related-label {
  font-family: $reader-font;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
  margin-bottom: 0.5rem;
}

.manual-tile__h2 {
  font-family: $reader-font;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  color: #333;
}

.manual-tile__h3 {
  font-family: $reader-font;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.35;
  color: $reader-green-dark;
}

:deep(.manual-body p) {
  font-family: $reader-font;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  color: $reader-text;
  font-size: 16px;
  font-style: normal;
}

:deep(.manual-body p:last-child) {
  margin-bottom: 0;
}

:deep(.manual-body img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.75rem auto;
  border-radius: 6px;
}

/* Images inside headings or accordion summaries are treated as inline icons.
   .manual-body prefix gives this higher specificity than the block img rule. */
:deep(.manual-body h2 img),
:deep(.manual-body h3 img),
:deep(.manual-body h4 img),
:deep(.manual-body h5 img),
:deep(.manual-body h6 img),
:deep(.manual-body summary img) {
  display: inline !important;
  width: 1.4em;
  height: 1.4em;
  vertical-align: middle;
  object-fit: contain;
  border-radius: 0;
  margin: 0 0.3em 0 0 !important;
}

/* Internal reference links — green, solid underline */
:deep(.manual-body a),
:deep(.manual-body .manual-ref-link) {
  color: $reader-green-dark;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* External links — blue */
:deep(.manual-body .manual-ext-link) {
  color: #1565c0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Glossary terms — green, dotted underline (already styled via span) */

:deep(.manual-glossary-term) {
  text-decoration: underline;
  text-decoration-style: dotted;
  color: $reader-green-dark;
  cursor: pointer;
}

/* ── Tag badges (block-level) ─────────────────────────────────────────────── */
/* Badge inside headings: heading becomes flex so the badge sits flush-right */
:deep(h2:has(.manual-tag-badge)),
:deep(h3:has(.manual-tag-badge)),
:deep(h4:has(.manual-tag-badge)) {
  display: flex;
  align-items: center;
  gap: 8px;

  .manual-tag-badge {
    margin: 0 0 0 auto; /* push badge to the far right */
    flex-shrink: 0;
  }
}

:deep(.manual-tag-badge) {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(76, 175, 80, 0.07);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 100px;
  padding: 2px 8px 2px 4px;
  margin: 0 0 0 6px; /* inline — sits after the content */
  vertical-align: middle;
  cursor: pointer;
  user-select: none;

  /* Icon-only pill: tighten padding when there is no label */
  &:has(.manual-tag-badge__icon):not(:has(.manual-tag-badge__label)) {
    padding: 2px 4px;
  }

  .manual-tag-badge__icon {
    font-size: 13px;
    line-height: 1;
    color: $reader-green-dark;
  }

  .manual-tag-badge__label {
    font-size: 0.67rem;
    font-weight: 700;
    color: $reader-green-dark;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &:hover,
  &:focus {
    background: rgba(76, 175, 80, 0.15);
    outline: none;
  }
}

/* ── Tag inline spans ─────────────────────────────────────────────────────── */
:deep(.manual-tag-inline) {
  cursor: pointer;
  color: $reader-green-dark;
  border-bottom: 1px solid rgba(76, 175, 80, 0.5);
  padding: 0 2px;
  border-radius: 2px;
  transition: background 0.12s ease;
  white-space: nowrap; /* prevent the inline badge from line-breaking mid-tag */
  display: inline-flex;
  align-items: center;
  gap: 2px;

  &:hover {
    background: rgba(76, 175, 80, 0.08);
  }

  .manual-tag-inline__icon {
    font-size: 0.8em;
    vertical-align: middle;
    color: $reader-green;
    line-height: 1;
  }
}

/* Tag info modal — reuses .manual-gloss-card structure */
.manual-tag-card .manual-tag-card__label {
  color: $reader-green-dark;

  .material-icons {
    color: $reader-green-dark;
  }
}

/* GitHub-style alerts — explicit light theme (package CSS relies on system color scheme) */
:deep(.markdown-alert) {
  margin: 0.75rem 0 1rem 0;
  padding: 0.75rem 1rem 0.85rem;
  font-size: 0.95rem;
  line-height: 1.5;
  border-radius: 8px;
  border: 1px solid #c8d9e1;
  border-left-width: 4px;
  background: #f6f8fa;
  color: #24292f;
}

:deep(.markdown-alert p) {
  margin: 0.35rem 0 0.35rem 0;
  color: #24292f;
  font-size: 0.95rem;
  font-style: normal;
}

:deep(.markdown-alert p:first-of-type) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #0969da;
  margin: 0 0 0.4rem 0;
}

:deep(.markdown-alert p .octicon) {
  flex-shrink: 0;
  fill: #0969da;
}

:deep(.markdown-alert.markdown-alert-note) {
  border-left-color: #2e7d32;
  background: #e8f5e9;
  border-color: rgba(46, 125, 50, 0.35);
}

:deep(.markdown-alert.markdown-alert-note p:first-of-type) {
  color: #1b5e20;
}

:deep(.markdown-alert.markdown-alert-note p .octicon) {
  fill: #2e7d32;
}

:deep(.markdown-alert.markdown-alert-tip) {
  border-left-color: #1b5e20;
  background: #e8f5e9;
}

:deep(.markdown-alert.markdown-alert-tip p:first-of-type) {
  color: #1b5e20;
}

:deep(.markdown-alert.markdown-alert-tip p .octicon) {
  fill: #1b5e20;
}

:deep(.markdown-alert.markdown-alert-warning) {
  border-left-color: #9a6700;
  background: #fff8c5;
}

:deep(.markdown-alert.markdown-alert-warning p:first-of-type) {
  color: #9a6700;
}

:deep(.markdown-alert.markdown-alert-warning p .octicon) {
  fill: #9a6700;
}

:deep(.markdown-alert.markdown-alert-caution) {
  border-left-color: #cf222e;
  background: #ffebe9;
}

:deep(.markdown-alert.markdown-alert-caution p:first-of-type) {
  color: #cf222e;
}

:deep(.markdown-alert.markdown-alert-caution p .octicon) {
  fill: #cf222e;
}

:deep(.markdown-alert pre) {
  font-size: 0.85rem;
  margin: 0.5rem 0 0 0;
}

.manual-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 68px 12px 12px;
}

.manual-overlay__card {
  width: 100%;
  max-width: 560px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.manual-overlay__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.manual-overlay__results {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.4rem;
}

.manual-search-hit {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  background: rgba(76, 175, 80, 0.1);
  color: #1b5e20;
}

.manual-search-hit i {
  font-size: 18px;
  color: #2e7d32;
}

:deep(ul) {
  padding-left: 1.25rem;
  margin: 0.5rem 0 1rem;
}

:deep(ul) li {
  list-style: disc;
  margin: 0.25rem 0;
}

:deep(ol) {
  padding-left: 1.25rem;
  margin: 0.5rem 0 1rem;
}

:deep(strong) {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

:deep(pre) {
  font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.85rem;
  line-height: 1.45;
  background: #f1f3f4;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  overflow-x: hidden;
}

:deep(code) {
  font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9em;
  background: #f1f3f4;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

:deep(pre code) {
  background: none;
  padding: 0;
  font-size: inherit;
}

/* Glossary bottom-sheet. Sized to the reading column (640px max) so the
   definition has the same comfortable line length as the manual body. */
.manual-gloss-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(#{$reader-nav-h} + 16px) 16px 16px;
}

.manual-gloss-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 24px 24px 28px;
  max-height: 80dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.manual-gloss-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.manual-gloss-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.manual-gloss-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.38);
}

.manual-gloss-label .material-icons {
  font-size: 14px;
  color: #f9a825;
}

.manual-gloss-term {
  font-family: $reader-font;
  font-size: 1.35rem;
  font-weight: 700;
  color: #263238;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.manual-gloss-close {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.4);
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin: -6px -6px 0 0;
  transition: background 0.15s ease, color 0.15s ease;
}

.manual-gloss-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.manual-gloss-close .material-icons {
  font-size: 20px;
}

.manual-gloss-jump {
  appearance: none;
  border: 1px solid rgba(46, 125, 50, 0.4);
  background: rgba(76, 175, 80, 0.06);
  color: $reader-green-dark;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  width: 100%;
  justify-content: center;
  transition: background 0.15s ease;
}

.manual-gloss-jump:hover {
  background: rgba(76, 175, 80, 0.12);
}

.manual-gloss-jump .material-icons {
  font-size: 18px;
}

.manual-gloss-text {
  font-family: $reader-font;
  margin: 0;
  font-size: 0.97rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.65);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Wrapper that positions the edge-swipe hint arrows relative to the card. */
.manual-h3-wrap {
  position: relative;
  margin: 1.25rem 0 0;
}

/* Edge arrow buttons: sit vertically centred at the left/right edge of the
   card. Very low opacity so they hint without distracting from content.
   `pointer-events: none` on is-hidden means the invisible arrows don't block
   tap targets behind them. */
.manual-h3-edge {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  border: none;
  background: #ffffff;
  border-radius: 999px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  cursor: default;
  opacity: 1;
  transition: opacity 0.15s ease;
  padding: 0;
  box-shadow: none;
}

.manual-h3-edge--prev { left: -12px; }
.manual-h3-edge--next { right: -12px; }

.manual-h3-edge.is-hidden {
  opacity: 0;
}

.manual-h3-edge .material-icons {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.3);
}

/* H3 subsection card: rendered one at a time, tile auto-sized to its content.
   Outlined with the reader green so the subsection reads as a distinct unit
   without tinting the reading surface. */
.manual-h3-card {
  margin: 0;
  padding: 1rem;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(76, 175, 80, 0.45);
  overflow-wrap: anywhere;
}

.manual-h3-card :deep(pre),
.manual-h3-card :deep(img) {
  max-width: 100%;
}

/* H4/H5/H6 accordion: <details>/<summary> generated by rehypeAccordion */
:deep(.manual-accordion) {
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 8px;
  margin: 0;
  overflow: hidden;
}

:deep(.manual-accordion + .manual-accordion) {
  margin-top: 4px;
}

/* First accordion in a block gets a small top margin for breathing room */
:deep(p + .manual-accordion),
:deep(ul + .manual-accordion),
:deep(ol + .manual-accordion) {
  margin-top: 0.5rem;
}

/* Nested accordions (h5 inside h4, h6 inside h5): no box border — just a
   subtle left indent so they don't create borders-within-borders. */
:deep(.manual-accordion .manual-accordion) {
  border: none;
  border-radius: 0;
  border-left: 2px solid rgba(0, 0, 0, 0.08);
  margin: 0.2rem 0 0.2rem 8px;
  overflow: visible;
}

:deep(.manual-accordion .manual-accordion[open]) {
  border-left-color: rgba(76, 175, 80, 0.4);
}

:deep(.manual-accordion .manual-accordion > .manual-accordion__summary) {
  font-size: 0.88rem;
  font-weight: 600;
  background: none;
  padding: 7px 10px;
}

:deep(.manual-accordion .manual-accordion[open] > .manual-accordion__summary) {
  background: none;
  border-bottom: none;
}

:deep(.manual-accordion .manual-accordion > *:not(summary)) {
  padding: 6px 10px 8px;
  font-size: 0.88rem;
}

:deep(.manual-accordion[open]) {
  border-color: rgba(76, 175, 80, 0.35);
}

:deep(.manual-accordion__summary) {
  font-family: 'Lato', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #263238;
  padding: 10px 14px;
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  background: rgba(0, 0, 0, 0.02);
  transition: background 0.12s ease;
}

:deep(.manual-accordion__summary:hover) {
  background: rgba(0, 0, 0, 0.05);
}

:deep(.manual-accordion[open] > .manual-accordion__summary) {
  background: rgba(76, 175, 80, 0.07);
  color: $reader-green-dark;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

/* Chevron indicator built with CSS so we don't depend on Material Icons
   inside a :deep context. */
:deep(.manual-accordion__summary::before) {
  content: '▶';
  font-size: 0.65rem;
  color: rgba(0, 0, 0, 0.35);
  transition: transform 0.18s ease;
  flex: 0 0 auto;
}

:deep(.manual-accordion[open] > .manual-accordion__summary::before) {
  transform: rotate(90deg);
  color: $reader-green-dark;
}

:deep(.manual-accordion > *:not(summary)) {
  padding: 10px 14px 12px;
  font-size: 0.95rem;
  line-height: 1.55;
}

/* Cursor + selection hints when subsections exist (desktop discoverability). */
.manual-slide__scroll.has-subs .manual-h3-wrap {
  cursor: grab;
}

.manual-slide__scroll.has-subs .manual-h3-wrap:active {
  cursor: grabbing;
}

/* Direction-aware H3 transitions. Both directions are 180ms, mode="out-in". */
.h3-next-enter-active,
.h3-next-leave-active,
.h3-prev-enter-active,
.h3-prev-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
  will-change: transform, opacity;
}

.h3-next-enter-from {
  transform: translateX(36px);
  opacity: 0;
}

.h3-next-leave-to {
  transform: translateX(-36px);
  opacity: 0;
}

.h3-prev-enter-from {
  transform: translateX(-36px);
  opacity: 0;
}

.h3-prev-leave-to {
  transform: translateX(36px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .h3-next-enter-active,
  .h3-next-leave-active,
  .h3-prev-enter-active,
  .h3-prev-leave-active {
    transition: opacity 0.12s ease;
    transform: none !important;
  }
}

/* Static reader footer: tile up/down + H3 dots in the thumb-reach zone.
   The bar background spans edge-to-edge, but the buttons are constrained to
   the same 720px column as .manual-reader__stage via a side-gutter that grows
   with the viewport. Below 720px the gutter falls back to 12px. */
.manual-reader-foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: $reader-foot-h;
  z-index: 1200;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(12px, calc((100% - 720px) / 2)) env(safe-area-inset-bottom, 0);
  gap: 8px;
}

.manual-foot-btn {
  appearance: none;
  border: 0;
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(76, 175, 80, 0.1);
  color: $reader-green-dark;
  transition: background 0.15s ease, transform 0.15s ease;
  flex: 0 0 auto;
}

.manual-foot-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.18);
}

.manual-foot-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.manual-foot-btn:disabled {
  opacity: 0.3;
  cursor: default;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.4);
}

.manual-foot-btn .material-icons {
  font-size: 24px;
}

/* Center cluster: ←  • • •  → (only ← and → shown when there are subsections). */
.manual-foot-center {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.manual-foot-btn--sub {
  width: 36px;
  height: 36px;
  background: transparent;
}

.manual-foot-btn--sub:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.12);
}

.manual-foot-btn--sub .material-icons {
  font-size: 22px;
}

/* Dots: prefer one horizontal row, wrapping only when there genuinely isn't
   room. flex: 0 1 auto means the container sizes to its content (all dots in
   a row) but can shrink when the parent is too narrow, at which point
   flex-wrap kicks in and justify-content: center re-centres every row. */
.manual-foot-dots {
  flex: 0 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 4px 6px;
  max-height: 100%;
  overflow: hidden;
}

.manual-foot-dot {
  appearance: none;
  border: 0;
  padding: 6px;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.manual-foot-dot::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.22);
  transition: background 0.15s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.manual-foot-dot:hover::before {
  background: rgba(0, 0, 0, 0.4);
}

.manual-foot-dot.is-active::before {
  background: $reader-green-dark;
  transform: scale(1.4);
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.18);
}

/* Fallback when there are too many subsections to fit dots in two rows. */
.manual-foot-counter {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: $reader-text;
  font-size: 0.95rem;
  min-width: 0;
}

.manual-foot-counter__num {
  color: $reader-green-dark;
  font-weight: 700;
}

.manual-foot-counter__sep {
  color: rgba(0, 0, 0, 0.3);
  margin: 0 2px;
}

.manual-foot-counter__total {
  color: rgba(0, 0, 0, 0.55);
}

/* Navigation drawer — bottom sheet overlay */
.manual-nav-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.manual-nav-drawer {
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
  max-height: 75dvh;
  display: flex;
  flex-direction: column;
}

.manual-nav-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex: 0 0 auto;
}

.manual-nav-drawer__title {
  font-family: $reader-font;
  font-weight: 700;
  font-size: 1rem;
  color: $reader-text;
}

.manual-nav-drawer__close {
  padding: 4px !important;
  height: 36px !important;
  width: 36px !important;
  line-height: 1 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.55) !important;
}

.manual-nav-drawer__body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
  flex: 1 1 auto;
}

.manual-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  font-family: $reader-font;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.1s ease;

  &.is-active {
    background: rgba(76, 175, 80, 0.08);
    color: $reader-green-dark;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.manual-nav-item--part {
  padding: 10px 16px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  cursor: default;
}

.manual-nav-item--tile {
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: $reader-text;
}

.manual-nav-item--sub {
  padding: 7px 16px 7px 40px;
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.7);
}

.manual-nav-item__icon {
  font-size: 18px;
  flex: 0 0 18px;
  color: rgba(0, 0, 0, 0.35);

  .manual-nav-item--tile & { color: $reader-green; }
  .manual-nav-item--part & { color: rgba(0, 0, 0, 0.25); }
  .is-active & { color: $reader-green-dark; }
}
</style>
