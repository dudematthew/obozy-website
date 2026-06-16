import { manualsMeta } from '../manuals-meta.js'

const SITE_URL = 'https://obozy.org.pl'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`
const DEFAULT_IMAGE_ALT = 'Obozy - Gra Terenowa - Uczestnicy w lesie podczas intensywnej gry terenowej'
const OG_IMAGE_WIDTH = '1200'
const OG_IMAGE_HEIGHT = '630'

function escapeAttr (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function upsertMeta (html, selector, content) {
  const esc = escapeAttr(content)
  if (selector.property) {
    const re = new RegExp(
      `(<meta property="${selector.property}" content=")[^"]*(")`,
      'i'
    )
    if (re.test(html)) return html.replace(re, `$1${esc}$2`)
    return html.replace(
      '</head>',
      `<meta property="${selector.property}" content="${esc}" />\n</head>`
    )
  }
  const re = new RegExp(
    `(<meta name="${selector.name}" content=")[^"]*(")`,
    'i'
  )
  if (re.test(html)) return html.replace(re, `$1${esc}$2`)
  return html.replace(
    '</head>',
    `<meta name="${selector.name}" content="${esc}" />\n</head>`
  )
}

function applyMeta (html, meta) {
  const title = meta.title || 'Obozy - Gra Terenowa'
  const description = meta.description || ''
  const url = meta.url || SITE_URL
  const image = meta.image || DEFAULT_OG_IMAGE
  const imageAlt = meta.imageAlt || title

  let out = html
  out = upsertMeta(out, { name: 'title' }, title)
  out = upsertMeta(out, { name: 'description' }, description)
  out = upsertMeta(out, { property: 'og:type' }, 'website')
  out = upsertMeta(out, { property: 'og:url' }, url)
  out = upsertMeta(out, { property: 'og:title' }, title)
  out = upsertMeta(out, { property: 'og:description' }, description)
  out = upsertMeta(out, { property: 'og:image' }, image)
  out = upsertMeta(out, { property: 'og:image:secure_url' }, image)
  out = upsertMeta(out, { property: 'og:image:width' }, OG_IMAGE_WIDTH)
  out = upsertMeta(out, { property: 'og:image:height' }, OG_IMAGE_HEIGHT)
  out = upsertMeta(out, { property: 'og:image:alt' }, imageAlt)
  out = upsertMeta(out, { property: 'og:site_name' }, 'Obozy - Gra Terenowa')
  out = upsertMeta(out, { property: 'twitter:card' }, 'summary_large_image')
  out = upsertMeta(out, { property: 'twitter:url' }, url)
  out = upsertMeta(out, { property: 'twitter:title' }, title)
  out = upsertMeta(out, { property: 'twitter:description' }, description)
  out = upsertMeta(out, { property: 'twitter:image' }, image)
  out = upsertMeta(out, { property: 'twitter:image:alt' }, imageAlt)
  out = upsertMeta(out, { name: 'twitter:image' }, image)
  return out
}

function resolveMeta (pathname) {
  const metaMap = {
    '/': {
      title: 'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
      description: 'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.',
      url: `${SITE_URL}/`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    },
    '/o-nas': {
      title: 'O nas - Historia i Pasja | Obozy - Gra Terenowa',
      description: 'Czym są Obozy? - od prostej gry w berka do złożonego systemu pełnego strategii.',
      url: `${SITE_URL}/o-nas`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    },
    '/dolacz-do-nas': {
      title: 'Dołącz do nas | Obozy - Gra Terenowa',
      description: 'Chcesz dołączyć do Obozów? Poznaj naszą ekipę i dowiedz się jak zostać obozowiczem.',
      url: `${SITE_URL}/dolacz-do-nas`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    },
    '/powiadomienia': {
      title: 'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa',
      description: 'Zapisz się i dowiedz się porządnie o terminach i najważniejszych informacjach.',
      url: `${SITE_URL}/powiadomienia`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    },
    '/quiz': {
      title: 'Quiz o Zamrożeniu | Obozy - Gra Terenowa',
      description: 'Sprawdź jak dobrze znasz zasady Stanu Zamrożenia!',
      url: `${SITE_URL}/quiz`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    },
    '/instrukcja': {
      title: 'Instrukcje | Obozy - Gra Terenowa',
      description: 'Lista interaktywnych instrukcji do gier Obozy.',
      url: `${SITE_URL}/instrukcja`,
      image: DEFAULT_OG_IMAGE,
      imageAlt: DEFAULT_IMAGE_ALT
    }
  }

  let meta = metaMap[pathname] ?? metaMap['/']

  if (pathname.startsWith('/instrukcja/')) {
    const manualId = pathname.split('/')[2]
    const manual = manualId && manualsMeta[manualId]
    if (manual) {
      meta = {
        title: manual.title,
        description: manual.description,
        url: `${SITE_URL}${pathname}`,
        image: DEFAULT_OG_IMAGE,
        imageAlt: manual.imageAlt || manual.title
      }
    }
  }

  return meta
}

export default async (request, context) => {
  if (request.method !== 'GET') {
    return context.next()
  }

  const response = await context.next()
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
  }

  const url = new URL(request.url)
  const meta = resolveMeta(url.pathname)
  const html = await response.text()
  const injected = applyMeta(html, meta)

  const headers = new Headers(response.headers)
  headers.set('content-type', 'text/html; charset=utf-8')

  return new Response(injected, {
    status: response.status,
    headers
  })
}

export const config = { path: '/*' }
