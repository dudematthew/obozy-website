# Konwencje autorów (instrukcje gier)

Dokument źródłowy: Markdown z lekkim rozszerzeniem. **Build** produkcyjny uruchamia `build:manuals` automatycznie. Podczas pracy lokalnie po zmianach w `.md` odpal: `npm run build:manuals` (a potem `npm run serve` / hot reload) — w przeciwnym razie w przeglądarce widać **stary** JSON w `src/data/manual-ir/`.

## Front matter (YAML, opcjonalnie)

```yaml
---
title: "Skrót w pasku tytułu"
description: "Dla wyszukiwarek"
logo: "obozy-mayhem-manual.assets/ikona.png"
glossary:
  slug-terminu: "Definicja w panelu słownika (dotyk)."
---
```

- **`title`**: krótki tytuł w UI (gdy plik .md go nie daje, używany jest **id** z konfiguracji).
- **`logo`**: ścieżka względem folderu, w którym leży plik .md; obraz kopiowany do `public/manual-assets/<id>/` podczas builda.
- **`glossary`**: słownik; w treści łącz: `[słowo](glossary:slug-terminu)`.

## Struktura nagłówków

- **`#`**: partia / rozdział (nowy „pionowy” stos slajdów, opcjonalna okładka partii z treścią do pierwszego `##`).
- **`##`**: ekran (kafel) — główna jednostka czytania, przewijalna w górę/dół w obrębie slajdu.
- **`###`**: w obrębie `##` — kolumny w poziomy karuzeli (H3), jeśli jest ich więcej niż zero.

Nie wstawiaj `[TOC]` — nawigację robi aplikacja.

## Alerty (GitHub)

```md
> [!NOTE]
> Treść
```

Obsługiwane typy: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION` (zgodnie z `remark-github-blockquote-alert`).

## Tagi w komentarzach (przyszła rozbudowa)

```html
<!-- manual:h3:mode list -->
```

(Parser może je ignorować aż do implementacji atrybutów w silniku.)

## Obrazki

Używaj ścieżek względnych względem katalogu pliku (np. `./obozy-mayhem-manual.assets/zdjecie.png`) lub wspólnego katalogu `*.assets/`. Nierozwiązane pliki powodują **ostrzeżenie** w buildu.

Zalecany katalog: `nazwa-manuala.assets/`.

## Rejestr nowej instrukcji

1. Skopiuj `manuals.config.json` — dodaj obiekt z `id` i `source` (ścieżka względem główek repo).
2. W `src/data/manual-ir/registry.js` dodaj: `import nowy from './nowy.json'` i wpis w obiekcie `manuals`.
3. `npm run build:manuals` (albo `npm run build`).

Aplikacja: **`/instrukcja/{id}`** (np. `/instrukcja/mayhem`).
