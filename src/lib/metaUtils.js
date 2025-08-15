/**
 * Utility for managing dynamic meta tags
 */

export function updateMetaTags(metaData) {
    // Update title
    if (metaData.title) {
        document.title = metaData.title;
        updateMetaProperty('og:title', metaData.title);
        updateMetaProperty('twitter:title', metaData.title);
        updateMetaName('title', metaData.title);
    }

    // Update description
    if (metaData.description) {
        updateMetaName('description', metaData.description);
        updateMetaProperty('og:description', metaData.description);
        updateMetaProperty('twitter:description', metaData.description);
    }

    // Update URL
    if (metaData.url) {
        updateMetaProperty('og:url', metaData.url);
        updateMetaProperty('twitter:url', metaData.url);
    }

    // Update image
    if (metaData.image) {
        updateMetaProperty('og:image', metaData.image);
        updateMetaProperty('twitter:image', metaData.image);
    }

    // Update image alt text
    if (metaData.imageAlt) {
        updateMetaProperty('og:image:alt', metaData.imageAlt);
        updateMetaProperty('twitter:image:alt', metaData.imageAlt);
    }

    // Update keywords
    if (metaData.keywords) {
        updateMetaName('keywords', metaData.keywords);
    }

    // Update structured data
    if (metaData.structuredData) {
        updateStructuredData(metaData.structuredData);
    }
}

function updateMetaProperty(property, content) {
    let element = document.querySelector(`meta[property="${property}"]`);
    if (element) {
        element.setAttribute('content', content);
    } else {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        element.setAttribute('content', content);
        document.head.appendChild(element);
    }
}

function updateMetaName(name, content) {
    let element = document.querySelector(`meta[name="${name}"]`);
    if (element) {
        element.setAttribute('content', content);
    } else {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
    }
}

function updateStructuredData(data) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
    if (existingScript) {
        existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

// Default meta data for different pages
export const metaConfigs = {
    home: {
        title: 'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
        description: 'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.',
        url: 'https://obozy.org.pl/',
        image: 'https://obozy.org.pl/og-image.png',
        imageAlt: 'Obozy - Gra Terenowa - Uczestnicy w lesie podczas intensywnej gry terenowej',
        keywords: 'obozy, gra terenowa, survival, przygoda, las, drużyna, flaga, zabawa, event, opole, weekend',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Obozy - Gra Terenowa",
            "url": "https://obozy.org.pl",
            "description": "Intensywna gra terenowa na łonie natury w okolicach Opola",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://obozy.org.pl/dolacz-do-nas",
                "query-input": "required name=search_term_string"
            }
        }
    },

    about: {
        title: 'O nas - Historia i Pasja | Obozy - Gra Terenowa',
        description: 'Poznaj historię Obozów - od prostej gry w berka do złożonego systemu pełnego strategii. Dowiedz się, dlaczego od lat wracamy na coroczne wydarzenie w lesie.',
        url: 'https://obozy.org.pl/o-nas',
        image: 'https://obozy.org.pl/og-image.png',
        imageAlt: 'Historia Obozów - Od prostej zabawy do intensywnej gry terenowej',
        keywords: 'obozy historia, gra terenowa opole, survival weekend, przygoda w lesie, galeria zdjęć',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "O nas - Obozy Gra Terenowa",
            "description": "Historia i filozofia Obozów - intensywnej gry terenowej organizowanej corocznie od 2016 roku",
            "url": "https://obozy.org.pl/o-nas",
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
        url: 'https://obozy.org.pl/dolacz-do-nas',
        image: 'https://obozy.org.pl/og-image.png',
        imageAlt: 'Dołącz do ekipy Obozów - Poznaj organizatorów i proces rekrutacji',
        keywords: 'dołącz do obozów, rekrutacja, kontakt, ekipa, organizatorzy, jak się zapisać, messenger',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Dołącz do nas - Obozy Gra Terenowa",
            "description": "Informacje o dołączeniu do Obozów i kontakt z organizatorami",
            "url": "https://obozy.org.pl/dolacz-do-nas",
            "mainEntity": {
                "@type": "ContactPoint",
                "contactType": "recruitment",
                "url": "https://www.messenger.com/obozygraterenowa",
                "availableLanguage": "Polish"
            }
        }
    }
};

// Function to get current page meta based on route name
export function getMetaForRoute(routeName) {
    switch (routeName) {
        case 'home':
            return metaConfigs.home;
        case 'about-us':
            return metaConfigs.about;
        case 'join-us':
            return metaConfigs.joinUs;
        default:
            return metaConfigs.home;
    }
} 