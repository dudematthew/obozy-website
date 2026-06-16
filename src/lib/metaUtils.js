/**
 * Utility for managing dynamic meta tags
 */

import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_URL
} from './siteMeta.js'

export function updateMetaTags(metaData) {
    const image = metaData.image || DEFAULT_OG_IMAGE
    const imageAlt = metaData.imageAlt || metaData.title || DEFAULT_OG_IMAGE_ALT

    if (metaData.title) {
        document.title = metaData.title
        updateMetaProperty('og:title', metaData.title)
        updateMetaProperty('twitter:title', metaData.title)
        updateMetaName('title', metaData.title)
    }

    if (metaData.description) {
        updateMetaName('description', metaData.description)
        updateMetaProperty('og:description', metaData.description)
        updateMetaProperty('twitter:description', metaData.description)
    }

    if (metaData.url) {
        updateMetaProperty('og:url', metaData.url)
        updateMetaProperty('twitter:url', metaData.url)
    }

    updateMetaProperty('og:image', image)
    updateMetaProperty('og:image:secure_url', image)
    updateMetaProperty('og:image:width', OG_IMAGE_WIDTH)
    updateMetaProperty('og:image:height', OG_IMAGE_HEIGHT)
    updateMetaProperty('og:image:alt', imageAlt)
    updateMetaProperty('twitter:image', image)
    updateMetaProperty('twitter:image:alt', imageAlt)
    updateMetaName('twitter:image', image)

    updateMetaProperty('og:type', 'website')
    updateMetaProperty('twitter:card', 'summary_large_image')
    updateMetaProperty('og:site_name', 'Obozy - Gra Terenowa')

    if (metaData.keywords) {
        updateMetaName('keywords', metaData.keywords)
    }

    if (metaData.structuredData) {
        updateStructuredData(metaData.structuredData)
    }
}

function updateMetaProperty(property, content) {
    let element = document.querySelector(`meta[property="${property}"]`)
    if (element) {
        element.setAttribute('content', content)
    } else {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        element.setAttribute('content', content)
        document.head.appendChild(element)
    }
}

function updateMetaName(name, content) {
    let element = document.querySelector(`meta[name="${name}"]`)
    if (element) {
        element.setAttribute('content', content)
    } else {
        element = document.createElement('meta')
        element.setAttribute('name', name)
        element.setAttribute('content', content)
        document.head.appendChild(element)
    }
}

function updateStructuredData(data) {
    const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]')
    if (existingScript) {
        existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-dynamic', 'true')
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
}

export const metaConfigs = {
    home: {
        title: 'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
        description: 'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.',
        url: `${SITE_URL}/`,
        image: DEFAULT_OG_IMAGE,
        imageAlt: DEFAULT_OG_IMAGE_ALT,
        keywords: 'obozy, gra terenowa, survival, przygoda, las, drużyna, flaga, zabawa, event, opole, weekend',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Obozy - Gra Terenowa",
            "url": SITE_URL,
            "description": "Intensywna gra terenowa na łonie natury w okolicach Opola",
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${SITE_URL}/dolacz-do-nas`,
                "query-input": "required name=search_term_string"
            }
        }
    },

    about: {
        title: 'O nas - Historia i Pasja | Obozy - Gra Terenowa',
        description: 'Poznaj historię Obozów - od prostej gry w berka do złożonego systemu pełnego strategii. Dowiedz się, dlaczego od lat wracamy na coroczne wydarzenie w lesie.',
        url: `${SITE_URL}/o-nas`,
        image: DEFAULT_OG_IMAGE,
        imageAlt: 'Historia Obozów - Od prostej zabawy do intensywnej gry terenowej',
        keywords: 'obozy historia, gra terenowa opole, survival weekend, przygoda w lesie, galeria zdjęć',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "O nas - Obozy Gra Terenowa",
            "description": "Historia i filozofia Obozów - intensywnej gry terenowej organizowanej corocznie od 2016 roku",
            "url": `${SITE_URL}/o-nas`,
            "mainEntity": {
                "@type": "Organization",
                "name": "Obozy - Gra Terenowa",
                "foundingDate": "2016",
                "description": "Organizatorzy corocznej intensywnej gry terenowej pełnej strategii i przygody"
            }
        }
    },

    joinUs: {
        title: 'Dołącz do nas - Instrukcje i Kontakt | Obozy - Gra Terenowa',
        description: 'Chcesz dołączyć do Obozów? Poznaj naszą ekipę i dowiedz się, jak możesz zostać uczestnikiem najbardziej intensywnej gry terenowej w okolicach Opola.',
        url: `${SITE_URL}/dolacz-do-nas`,
        image: DEFAULT_OG_IMAGE,
        imageAlt: 'Dołącz do ekipy Obozów - Poznaj organizatorów i proces rekrutacji',
        keywords: 'dołącz do obozów, rekrutacja, kontakt, ekipa, organizatorzy, jak się zapisać, messenger',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Dołącz do nas - Obozy Gra Terenowa",
            "description": "Informacje o dołączeniu do Obozów i kontakt z organizatorami",
            "url": `${SITE_URL}/dolacz-do-nas`,
            "mainEntity": {
                "@type": "ContactPoint",
                "contactType": "recruitment",
                "url": "https://www.messenger.com/obozygraterenowa",
                "availableLanguage": "Polish"
            }
        }
    }
}

export function getMetaForRoute(routeName) {
    switch (routeName) {
        case 'home':
            return metaConfigs.home
        case 'about-us':
            return metaConfigs.about
        case 'join-us':
            return metaConfigs.joinUs
        case 'manual':
            return {
                title: 'Instrukcja | Obozy - Gra Terenowa',
                description: 'Interaktywna instrukcja gry terenowej Obozy (wersja w przeglądarce).',
                image: DEFAULT_OG_IMAGE,
                imageAlt: DEFAULT_OG_IMAGE_ALT
            }
        case 'manual-index':
            return {
                title: 'Instrukcje | Obozy - Gra Terenowa',
                description: 'Lista interaktywnych instrukcji do gier Obozy.',
                image: DEFAULT_OG_IMAGE,
                imageAlt: DEFAULT_OG_IMAGE_ALT
            }
        case 'quiz':
            return {
                title: 'Quiz o Zamrożeniu | Obozy - Gra Terenowa',
                description: 'Sprawdź, jak dobrze znasz zasady Stanu Zamrożenia! Rozwiąż quiz i dowiedz się, czy jesteś gotowy na pole bitwy.',
                image: DEFAULT_OG_IMAGE,
                imageAlt: 'Quiz o Zamrożeniu | Obozy - Gra Terenowa'
            }
        case 'powiadomienia':
            return {
                title: 'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa',
                description: 'Zostaw swój adres e-mail i dowiedz się pierwszy o terminie, lokalizacji i wolnych miejscach na kolejnej edycji Obozów.',
                image: DEFAULT_OG_IMAGE,
                imageAlt: 'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa'
            }
        default:
            return metaConfigs.home
    }
}

/** Apply route-aware Open Graph / Twitter meta in the SPA. */
export function applyRouteMeta(route) {
    const preset = getMetaForRoute(route.name)
    updateMetaTags({
        title: route.meta?.title || preset.title,
        description: route.meta?.description || preset.description,
        image: DEFAULT_OG_IMAGE,
        imageAlt: route.meta?.title || preset.imageAlt || DEFAULT_OG_IMAGE_ALT,
        url: `${window.location.origin}${route.fullPath}`,
        keywords: preset.keywords,
        structuredData: preset.structuredData
    })
}
