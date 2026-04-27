---
title: "Konwencje autorów"
description: "Jak pisać instrukcje gier dla aplikacji Obozy – Mayhem."
---

# Konwencje autorów

Ten plik jest widoczny tylko w trybie deweloperskim (`npm run serve`). Opisuje cały dostępny zestaw rozszerzeń Markdown.

Po każdej zmianie pliku `.md` uruchom `npm run build:manuals`, a następnie odśwież `npm run serve`.

## Front matter (YAML)

```yaml
---
title: "Obozy – Mayhem"
description: "Krótki opis dla wyszukiwarek i OG tagów."
logo: "obozy-mayhem-manual.assets/ikona.png"
related:
  - classic
tags:
  original:
    icon: "content_copy"
    label: "Znane z podstawowej gry"
    description: "Ten fragment jest identyczny z grą Obozy – Gra Terenowa."
  advanced:
    icon: "psychology"
    label: "Dla zaawansowanych"
    description: "Zaawansowana mechanika – przy pierwszej lekturze można pominąć."
  note:
    icon: "info"
    label: ""
    description: "Dodatkowa informacja."
glossary:
  eliminacja:
    display: "Eliminacja gracza"
    definition: "Pełny opis terminu widoczny w panelu słownika."
    link: "eliminacja-i-wskrzeszenie"
  zwoj:
    display: "Zwój"
    definition: "Jednorazowy przedmiot z efektem."
    link: "zwoje"
---
```

### Pola front matter

- **`title`** – tytuł wyświetlany w nagłówku czytnika i tytule karty przeglądarki.
- **`description`** – tekst dla wyszukiwarek; trafia też do OG tagów generowanych przez `og-inject.js`.
- **`logo`** – ścieżka względem folderu `.md`; obraz jest kopiowany do `public/manual-assets/<id>/`.
- **`related`** – lista `id` powiązanych instrukcji; wyświetlana na ekranach końcowych.
- **`tags`** – słownik tagów dostępnych w tym pliku. Każdy tag: `icon` (Material Icons), `label` (tekst etykiety – pusty string = tylko ikona), `description` (treść w modalu). Klucze powinny być ASCII.
- **`glossary`** – słownik terminów. Każdy wpis: `display` (pełna nazwa w modalu), `definition` (definicja), `link` (slug sekcji do której odsyła przycisk „przejdź"). Klucze MUSZĄ być ASCII – bez polskich liter (np. `zwoj`, nie `zwój`).

## Struktura nagłówków

```
# Część I – Zasady
Tekst opcjonalnej okładki tej części.

## Sekcja główna
Treść sekcji (może zawierać H3 lub H4+).

### Podsekcja
Treść podsekcji (przewijana poziomo).

#### Podnagłówek (akordeon)
Domyślnie zwinięty. H5 i H6 też są akordeонами.
```

- **`#` (H1)** – nowa część / rozdział. Tworzy oddzielny pionowy stos kafli. Tekst poniżej H1 (przed pierwszym H2) pojawia się jako strona tytułowa tej części.
- **`##` (H2)** – kafel (pełnoekranowy slajd). Użytkownik przewija w górę/dół.
- **`###` (H3)** – podsekcja wewnątrz kafla. Użytkownik przesuwa w lewo/prawo.
- **`####`+ (H4/H5/H6)** – akordeon – domyślnie zwinięty. Otwierając, treść jest widoczna.

Nie wstawiaj ręcznej nawigacji ani `[TOC]` – robi to aplikacja.

## Tagi sekcji

Umieszczony bezpośrednio przed pierwszym akapitem sekcji komentarz przyczepia tag do tytułu tej sekcji (H2 lub H3). Kliknięcie otwiera modal z opisem.

```md
### ^Sposób walki

<!-- manual:tag original -->
Tekst pierwszego akapitu tej sekcji...
```

Inline w tekście:

```md
Użyj [Zwoju Zmartwychwstania](tag:advanced) żeby przywrócić gracza.
```

Jeśli `label` tagu jest pustym stringiem, wyświetlana jest sama ikona (pill bez tekstu).

## Glossary – linki w treści

```md
Gracz traci [bibuły](glossary:bibula) i zostaje wyeliminowany.
```

Klucz po `glossary:` musi być identyczny z kluczem w front matter (ASCII). Kliknięcie otwiera modal z definicją i przyciskiem „przejdź do sekcji" jeśli `link` jest podany.

## Linki wewnętrzne

```md
Szczegóły w sekcji [Sposób walki](#sposob-walki).
```

Slug po `#` powinien być slugiem tytułu H2/H3 (małe litery, myślniki zamiast spacji). Kliknięcie przewija do odpowiedniego kafla lub podsekcji.

## Linki zewnętrzne

```md
Więcej na [stronie projektu](https://obozy.org.pl).
```

Otwierają się w nowej karcie z `rel="noopener noreferrer"`. Wyświetlane na niebiesko.

## Akordeon z domyślnie otwartym stanem

```md
<!-- manual:expand true -->
#### Spis ołtarzy
```

Komentarz przed nagłówkiem H4+ sprawia, że akordeon jest domyślnie otwarty.

## Obrazki

Używaj ścieżek względnych względem folderu pliku `.md`:

```md
![Opis](./obozy-mayhem-manual.assets/zdjecie.png)
```

Obraz w akapicie jest wyświetlany na pełną szerokość kolumny.

Obraz inline w nagłówku lub tytule akordeonu (`<img>` wewnątrz `#####`) jest automatycznie skalowany do rozmiaru ikony (`1.4em`):

```md
##### Sowa <img src="./obozy-mayhem-manual.assets/icons8-owl-100.png" alt="sowa" />
```

Jeśli potrzebujesz kontrolować rozmiar obrazu w akapicie, użyj składni Typora:

```md
![Opis](./assets/rysunek.png){ style="zoom:50%;" }
```

lub inline HTML z atrybutem style:

```html
<img src="./assets/rysunek.png" alt="Opis" style="zoom:50%;" />
```

Build konwertuje `zoom:50%` → `max-width:50%;height:auto`.

## Alerty (GitHub-style)

```md
> [!NOTE]
> To jest notatka.

> [!WARNING]
> Ważne ostrzeżenie.
```

Obsługiwane typy: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.

## Rejestr nowej instrukcji

1. Dodaj wpis w `manuals.config.json`:

```json
{ "id": "moja-gra", "source": "src/assets/game-manuals/moja-gra.md" }
```

Dla instrukcji widocznej tylko lokalnie (np. ten plik):

```json
{ "id": "authoring", "source": "src/assets/game-manuals/authoring-guide.md", "devOnly": true }
```

2. Dodaj import w `src/data/manual-ir/registry.js`:

```js
import mojaGra from './moja-gra.json'
// ...
const manuals = { mayhem, classic, mojaGra }
```

3. `npm run build:manuals`.

Aplikacja udostępni instrukcję pod adresem **`/instrukcja/moja-gra`**.

## URL i udostępnianie

Każda zmiana kafla aktualizuje URL: `/instrukcja/mayhem/sposob-walki`. Takie linki można bezpośrednio udostępniać – aplikacja przewinie do właściwego kafla przy wczytaniu.
