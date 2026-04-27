import { manualsMeta } from './manuals-meta.js'

export default async (request, context) => {
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || '';

    // Wykryj crawlery (Facebook, Messenger, Twitter, Google, itp.)
    const isCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|discordbot|googlebot/i.test(ua);

    if (!isCrawler) {
        return context.next(); // Normalny użytkownik — Vue ogarnie
    }

    // Meta per route
    const metaMap = {
        '/': {
            title: 'Obozy - Gra Terenowa | Prawdziwa przygoda w lesie',
            description: 'Spędź dwa dni na łonie natury tocząc wspólnie zaciekły bój o flagę. Odkryj intensywną grę terenową pełną strategii, pracy zespołowej i prawdziwej adrenaliny.',
        },
        '/o-nas': {
            title: 'O nas - Historia i Pasja | Obozy - Gra Terenowa',
            description: 'Czym są Obozy? - od prostej gry w berka do złożonego systemu pełnego strategii.',
        },
        '/dolacz-do-nas': {
            title: 'Dołącz do nas | Obozy - Gra Terenowa',
            description: 'Chcesz dołączyć do Obozów? Poznaj naszą ekipę i dowiedz się jak zostać obozowiczem.',
        },
        '/powiadomienia': {
            title: 'Bądź na bieżąco - Powiadomienia | Obozy - Gra Terenowa',
            description: 'Zapisz się i dowiedz się porządnie o terminach i najważniejszych informacjach.',
        },
        '/quiz': {
            title: 'Quiz o Zamrożeniu | Obozy - Gra Terenowa',
            description: 'Sprawdź jak dobrze znasz zasady Stanu Zamrożenia!',
        },
        '/instrukcja': {
            title: 'Instrukcje | Obozy - Gra Terenowa',
            description: 'Lista interaktywnych instrukcji do gier Obozy.',
        },
    };

    // Resolve per-manual OG tags from the build-generated manuals-meta.js
    let meta = metaMap[url.pathname] ?? metaMap['/'];
    if (url.pathname.startsWith('/instrukcja/')) {
        const manualId = url.pathname.split('/')[2]
        if (manualId && manualsMeta[manualId]) {
            meta = manualsMeta[manualId]
        }
    }
    const siteUrl = 'https://obozy.org.pl'; // ← zmień na swoją domenę

    const response = await context.next();
    const html = await response.text();

    const injected = html.replace(
        '</head>',
        `<meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${siteUrl}${url.pathname}" />
    <meta property="og:type" content="website" />
    <meta name="description" content="${meta.description}" />
    </head>`
    );

    return new Response(injected, {
        headers: { 'content-type': 'text/html' },
    });
};

export const config = { path: '/*' };