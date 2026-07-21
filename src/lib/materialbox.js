/**
 * Shared Materialize Materialbox setup for the whole site.
 *
 * Docs (https://materializecss.com/media.html) only expose duration + open/close
 * callbacks — no option to keep the lightbox open on scroll/resize. We:
 *  - lock page scroll while open (so the page cannot slide out from under it)
 *  - no-op Materialbox's scroll/resize → close handlers
 *  - show a clear close (X) control
 *  - still allow dismiss via click, overlay click, or ESC
 *
 * Important: M.Materialbox.init() only accepts Element | NodeList | jQuery/cash.
 * Passing a plain Array is silently ignored.
 */

/* global M */

const LOCK_FLAG = 'obozyMaterialboxScrollLock'
const LOCK_Y = 'obozyMaterialboxScrollY'
const CLOSE_BTN_ID = 'obozy-materialbox-close'

const defaultOptions = {
  inDuration: 0,
  outDuration: 0
}

export function lockMaterialboxPageScroll () {
  const html = document.documentElement
  const body = document.body
  if (body.dataset[LOCK_FLAG] === '1') return
  body.dataset[LOCK_FLAG] = '1'
  body.dataset[LOCK_Y] = String(window.scrollY || window.pageYOffset || 0)
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${body.dataset[LOCK_Y]}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}

export function unlockMaterialboxPageScroll () {
  const html = document.documentElement
  const body = document.body
  if (body.dataset[LOCK_FLAG] !== '1') return
  const y = Number(body.dataset[LOCK_Y] || 0)
  delete body.dataset[LOCK_FLAG]
  delete body.dataset[LOCK_Y]
  html.style.overflow = ''
  body.style.overflow = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  window.scrollTo(0, y)
}

function removeMaterialboxCloseButton () {
  const btn = document.getElementById(CLOSE_BTN_ID)
  if (btn) btn.remove()
}

/**
 * Visible close control — Materialbox has no built-in X.
 * @param {object} instance - M.Materialbox instance for the open image
 */
function showMaterialboxCloseButton (instance) {
  removeMaterialboxCloseButton()
  if (!instance || typeof instance.close !== 'function') return

  const btn = document.createElement('button')
  btn.id = CLOSE_BTN_ID
  btn.type = 'button'
  btn.className = 'obozy-materialbox-close'
  btn.setAttribute('aria-label', 'Zamknij')
  btn.innerHTML = '<i class="material-icons" aria-hidden="true">close</i>'
  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    instance.close()
  })
  document.body.appendChild(btn)
}

/**
 * @param {ParentNode|string} [root=document] - element or CSS selector to search within
 * @returns {NodeListOf<Element>}
 */
export function queryMaterialboxed (root = document) {
  const scope = typeof root === 'string' ? document.querySelector(root) : root
  if (!scope || typeof scope.querySelectorAll !== 'function') {
    return document.querySelectorAll('.materialboxed')
  }
  return scope.querySelectorAll('.materialboxed')
}

/**
 * Destroy Materialbox instances under root (safe if none).
 * @param {ParentNode|string} [root=document]
 */
export function destroyMaterialbox (root = document) {
  if (typeof M === 'undefined' || !M.Materialbox) return
  queryMaterialboxed(root).forEach((el) => {
    const instance = M.Materialbox.getInstance(el)
    if (instance) instance.destroy()
  })
  removeMaterialboxCloseButton()
  unlockMaterialboxPageScroll()
}

/**
 * Init Materialbox with site-wide lightbox behaviour.
 * @param {ParentNode|string|NodeList|Element} [rootOrEls=document]
 * @param {object} [options] - merged over defaults; onOpenStart/onCloseEnd are chained
 * @returns {object[]|object|null} Materialize instance(s)
 */
export function initMaterialbox (rootOrEls = document, options = {}) {
  if (typeof M === 'undefined' || !M.Materialbox) return null

  let els
  if (rootOrEls instanceof Element) {
    els = rootOrEls.classList.contains('materialboxed')
      ? rootOrEls
      : rootOrEls.querySelectorAll('.materialboxed')
  } else if (rootOrEls instanceof NodeList || (rootOrEls && rootOrEls.jquery) || (rootOrEls && rootOrEls.cash)) {
    els = rootOrEls
  } else if (typeof rootOrEls === 'string') {
    els = queryMaterialboxed(rootOrEls)
  } else {
    els = queryMaterialboxed(rootOrEls || document)
  }

  const length = els instanceof Element ? 1 : (els && els.length) || 0
  if (!length) return null

  const userOpenStart = options.onOpenStart
  const userCloseEnd = options.onCloseEnd
  const merged = {
    ...defaultOptions,
    ...options,
    onOpenStart (el) {
      lockMaterialboxPageScroll()
      showMaterialboxCloseButton(this)
      if (typeof userOpenStart === 'function') userOpenStart.call(this, el)
    },
    onCloseEnd (el) {
      removeMaterialboxCloseButton()
      unlockMaterialboxPageScroll()
      if (typeof userCloseEnd === 'function') userCloseEnd.call(this, el)
    }
  }

  const instances = M.Materialbox.init(els, merged)
  const list = instances == null
    ? []
    : Array.isArray(instances)
      ? instances
      : [instances]

  list.forEach((instance) => {
    if (!instance) return
    // open() binds scroll/resize → close(); keep click + ESC only.
    instance._handleWindowScroll = function () {}
    instance._handleWindowResize = function () {}
  })

  return instances
}
