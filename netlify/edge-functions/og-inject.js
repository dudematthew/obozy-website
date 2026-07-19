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
  const path = (pathname.replace(/\/+$/, '') || '/')

  const entry = (title, description, urlPath = path) => ({
    title,
    description,
    url: `${SITE_URL}${urlPath}`,
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_IMAGE_ALT
  })

  const metaMap = {
    '/': entry(
      'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
      'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.',
      '/'
    ),
    '/o-nas': entry(
      'O nas - Historia i Pasja | Obozy - Gra Terenowa',
      'Czym są Obozy? - od prostej gry w berka do złożonego systemu pełnego strategii.'
    ),
    '/dolacz-do-nas': entry(
      'Dołącz do nas | Obozy - Gra Terenowa',
      'Chcesz dołączyć do Obozów? Poznaj naszą ekipę i dowiedz się jak zostać obozowiczem.'
    ),
    '/powiadomienia': entry(
      'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa',
      'Zapisz się i dowiedz się porządnie o terminach i najważniejszych informacjach.'
    ),
    '/quiz': entry(
      'Quiz o Zamrożeniu | Obozy - Gra Terenowa',
      'Sprawdź jak dobrze znasz zasady Stanu Zamrożenia!'
    ),
    '/instrukcja': entry(
      'Instrukcje | Obozy - Gra Terenowa',
      'Lista interaktywnych instrukcji do gier Obozy.'
    ),
    '/mayhem/generator-miejsc': entry(
      'Generator miejsc startowych | Mayhem',
      'Losuj każdej drużynie Mayhem dwa sąsiadujące miejsca (1–12) na ołtarze startowe.'
    ),
    '/gra': entry(
      'Tajna Gra | Obozy Festiwal',
      'Znalazłeś zadanie. Tajna zabawa festiwalu.'
    ),
    '/gra/gracz': entry(
      'Twój postęp | Obozy Festiwal',
      'Twój wynik i tożsamość w tajnej zabawie festiwalu.'
    ),
    '/gra/gracze': entry(
      'Ranking | Obozy Festiwal',
      'Ranking punktowy tajnej zabawy.'
    ),
    '/gra/konto': entry(
      'Twój postęp | Obozy Festiwal',
      'Twój wynik i tożsamość w tajnej zabawie festiwalu.',
      '/gra/gracz'
    ),
    '/gra/ja': entry(
      'Twój postęp | Obozy Festiwal',
      'Twój wynik i tożsamość w tajnej zabawie festiwalu.',
      '/gra/gracz'
    ),
    '/gra/host': entry(
      'CMR Organizatorów | Gra tajna',
      'Panel organizatorów.'
    ),
    '/gra/host/zadania/nowe': entry(
      'Nowe zadanie | Host',
      'Utwórz zadanie festiwalowe.'
    )
  }

  if (metaMap[path]) return metaMap[path]

  if (path.startsWith('/instrukcja/')) {
    const manualId = path.split('/')[2]
    const manual = manualId && manualsMeta[manualId]
    if (manual) {
      return {
        title: manual.title,
        description: manual.description,
        url: `${SITE_URL}${path}`,
        image: DEFAULT_OG_IMAGE,
        imageAlt: manual.imageAlt || manual.title
      }
    }
  }

  // Dynamic festival routes (tokens / task ids) — keep full URL for shareable links
  if (path.startsWith('/gra/t/')) {
    return entry(
      'Zadanie | Gra tajna',
      'Przyjmij i wykonaj zadanie festiwalowe.'
    )
  }
  if (path.startsWith('/gra/v/')) {
    return entry(
      'Potwierdzenie | Gra tajna',
      'Podgląd statusu zadania bez możliwości akceptacji.'
    )
  }
  if (path.startsWith('/gra/host/zadania/')) {
    return entry(
      'Zadanie | Host',
      'Edycja zadania i kody QR.'
    )
  }
  if (path.startsWith('/gra/')) {
    return entry(
      'Tajna Gra | Obozy Festiwal',
      'Tajna zabawa festiwalu Obozy.'
    )
  }

  return metaMap['/']
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
