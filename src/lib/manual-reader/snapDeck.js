/**
 * SnapDeck: lightweight reader controller for vertical tiles with inner scroll.
 *
 * Policy:
 * - inner scroll always wins while it can scroll
 * - at edge, wheel (or touch swipe) moves to prev/next tile
 * - no mouse wheel: use keyboard, or call opts.requestTileMove(±1) from UI buttons
 *
 * No external dependencies.
 */
export class SnapDeck {
  /**
   * @param {{
   *  getCount: ()=>number,
   *  getIndex: ()=>number,
   *  setIndex: (n:number)=>void,
   *  getScrollEl: ()=>HTMLElement|null,
   *  prefersReducedMotion?: ()=>boolean,
   * }} opts
   */
  constructor (opts) {
    this.opts = opts
    this._onWheel = this._onWheel.bind(this)
    this._onKey = this._onKey.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)
    this._onTouchCancel = this._onTouchCancel.bind(this)
    this._touch = null
    this._lockedUntil = 0
  }

  mount (rootEl) {
    this.rootEl = rootEl
    // wheel: non-passive so we can prevent page scroll
    rootEl.addEventListener('wheel', this._onWheel, { passive: false })
    window.addEventListener('keydown', this._onKey, true)
    rootEl.addEventListener('touchstart', this._onTouchStart, { passive: true })
    rootEl.addEventListener('touchend', this._onTouchEnd, { passive: true })
    rootEl.addEventListener('touchcancel', this._onTouchCancel, { passive: true })
  }

  unmount () {
    if (!this.rootEl) return
    this.rootEl.removeEventListener('wheel', this._onWheel)
    window.removeEventListener('keydown', this._onKey, true)
    this.rootEl.removeEventListener('touchstart', this._onTouchStart)
    this.rootEl.removeEventListener('touchend', this._onTouchEnd)
    this.rootEl.removeEventListener('touchcancel', this._onTouchCancel)
    this.rootEl = null
  }

  /** Next (+1) or previous (−1) tile — same throttling as wheel/keyboard. */
  nudge (dir) {
    this._move(dir)
  }

  _canScrollUp (el) {
    return el && el.scrollTop > 0
  }

  _canScrollDown (el) {
    if (!el) return false
    return el.scrollTop + el.clientHeight < el.scrollHeight - 1
  }

  _move (dir) {
    const now = Date.now()
    if (now < this._lockedUntil) return
    const idx = this.opts.getIndex()
    const next = idx + dir
    const max = this.opts.getCount() - 1
    if (next < 0 || next > max) return
    this._lockedUntil = now + 350
    this.opts.setIndex(next)
  }

  _onWheel (e) {
    const el = this.opts.getScrollEl()
    const dy = e.deltaY
    const up = dy < 0
    const down = dy > 0
    if (!el) return

    // If inner can scroll, do not move tiles.
    if ((up && this._canScrollUp(el)) || (down && this._canScrollDown(el))) {
      return
    }

    // At edge: consume and move tile.
    e.preventDefault()
    if (down) this._move(+1)
    if (up) this._move(-1)
  }

  _keyConsumes (e) {
    const t = e.target
    if (!t || !t.nodeType) return false
    const tag = (t.tagName && t.tagName.toLowerCase()) || ''
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
    if (typeof t.isContentEditable === 'boolean' && t.isContentEditable) return true
    return false
  }

  _onKey (e) {
    if (this._keyConsumes(e)) return
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      this._move(+1)
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      this._move(-1)
    }
  }

  _onTouchStart (e) {
    if (!e.touches || e.touches.length !== 1) {
      this._touch = null
      return
    }
    const t = e.touches[0]
    const el = this.opts.getScrollEl()
    this._touch = {
      x0: t.clientX,
      y0: t.clientY,
      scroll0: el ? el.scrollTop : 0
    }
  }

  _onTouchEnd (e) {
    if (!this._touch) return
    const { x0: startX, y0: startY, scroll0 } = this._touch
    const te = (e.changedTouches && e.changedTouches[0]) || null
    const endY = te ? te.clientY : startY
    const endX = te ? te.clientX : startX
    this._touch = null
    const el = this.opts.getScrollEl()
    if (!el) return

    const dy = endY - startY
    const dx = endX - startX

    // Horizontal-dominant gesture: leave it for the H3 swipe handler.
    if (Math.abs(dx) > Math.abs(dy)) return

    const minSwipe = 48
    const scroll1 = el.scrollTop
    const userScrolledInner = Math.abs(scroll1 - scroll0) > 24

    const scrollH = el.scrollHeight
    const ch = el.clientHeight
    const atTop = scroll1 <= 0
    const atBottom = scroll1 + ch >= scrollH - 1
    const canScroll = scrollH > ch + 2

    if (canScroll) {
      if (userScrolledInner) return
      if (atTop && dy > minSwipe) this._move(-1)
      else if (atBottom && dy < -minSwipe) this._move(+1)
    } else {
      if (dy < -minSwipe) this._move(+1)
      else if (dy > minSwipe) this._move(-1)
    }
  }

  _onTouchCancel () {
    this._touch = null
  }
}

