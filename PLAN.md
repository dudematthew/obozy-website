# Interactive game manuals — research & implementation plan

This document is the **authoritative pre-implementation spec** for turning Markdown manuals into a **mobile-first, interactive reading experience** inside the existing Vue 3 app. **No application code should be written until this plan is reviewed and agreed upon.**

The goals are: (1) **minimal surface area outside `.md` files**—authors edit Markdown, YAML front matter, and **HTML comment tags**; (2) a **reusable “manual engine”** that could be published as a separate package; (3) **UX that reduces fear of long docs** (chunking, progress, optional depth); (4) **architectural discipline** so the system does not “crumble” as features accrue.

**Scope note:** In-app and site-wide **links to instructions are out of scope** for this work—the team will update them manually when ready. GDrive **remains** the place for **downloadable** documents; the web manual is an **additional** reading path, not a replacement for hosted files.

---

## 0. Resolved product decisions (changelog)

| Topic | Decision |
|--------|----------|
| CSS framework | **Materialize** only for manual UI. **No Bulma** in new code. |
| Glossary link syntax | **`[term](glossary:slug)`** (slug matches glossary entries in front matter or footnote index). |
| `^` prefix in headings | **Not supported.** Use **`<!-- manual:... -->` comments** for tags. |
| `[TOC]` in Markdown | **Remove** from author files. The app **replaces** toc with its own nav; engine may **strip/ignore** leftover `[TOC]`. |
| Language | **Polish only** for v1. |
| Route loading | **Lazy / ad hoc** (`() => import(...)` for the manual view and optionally **per-manual** chunks). |
| Code fences | **Normal `<pre><code>`** blocks for now (no special tabs for ` ```md ` variants in v1). |
| **First tile / title** | See **§3.3** (YAML `title` = short name; first **H1** opens the **info/cover** tile; body under that H1 fills it; **visually distinct** from other tiles). |
| **Further H1s (parts)** | A **second (and any further) H1** behaves like a **new chapter / part**—it may get its own **cover-style** intro tile, but the UI must make clear it is still the **same document** (shared chrome, **YAML `title`**, part label/breadcrumb, optional **logo** from metadata on each part title tile; see **§3.2**). |
| **`logo` in front matter** | Optional path (or URL) to an image used to **identify the guide** (e.g. in **title/cover** tiles, nav, or list entries). Resolved like other assets at **build** time. |
| **Build vs runtime** | **Markdown is not edited or parsed on the client.** The **unified/remark** pipeline runs **at build** only, producing **static IR** (e.g. JSON) shipped with the app. **Required** for the current **Netlify** static + SPA routing setup and predictable performance. |
| H2 “gum” snap | **Product requirement:** when scrolling, the view **snaps** so **one H2** is always the “main” phone screen; users may **scroll faster**, but the dominant motion **settles** on a single H2. **§7.1** names the **single** library strategy (Swiper first; fullPage-class only on failure). |
| Search | v1: **search UI in the app** (filter client-side from IR or plain text as available). Later: real **indexer** (build step or service) if needed. |
| Authoring docs | A **dedicated `*.md` manual for authors** (conventions, comments, front matter) is a **deliverable** of the project. |

---

## 1. Project context (what exists today)

### 1.1 Stack (from `package.json` and `App.vue`)

| Piece | Role in this project | Relevance to manuals |
|--------|------------------------|------------------------|
| **Vue 3** + **vue-router 4** | SPA, history mode | **Lazy** manual route; deep links to part/chapter/tile (hash/params TBD in implementation). |
| **@vue/cli-service** (Vue CLI 5) | Build, not Vite | Raw `import` of `.md` via webpack; `fs` is **disabled** in client (`vue.config.js`). |
| **materialize-css** | Primary layout (`container`, `row`/`col`, waves, `material-icons`) | **Sole** layout system for new manual UI. |
| **Swiper 8** | `GalleryCarousel.vue` + **candidate for vertical H2 snap and horizontal H3** | **Central** to scroll UX; see **§7.1** vs adding **fullPage.js**. |
| **markdown-it 14** | `QuizView.vue` only | **Out of scope** for the manual engine; keep quiz separate unless you later **unify** pipelines. |
| **Bulma** | In `package.json`; almost unused in views | **Do not use** for manuals; do not add patterns that depend on Bulma. |

**Conclusion for styling:** **Materialize** + existing green/brand tokens; **compact** long-read typography; one navigation model per screen.

### 1.2 Current manual sample (`src/assets/game-manuals/obozy-mayhem-manual.md`)

- **To migrate out:** `[TOC]`, any **`^` prefixes** (replaced by tag comments or dropped).
- **Sectioning, alerts, ` ``` ` blocks, images:** as before; **image paths** must be normalized to the chosen `src/assets/.../manual.assets/` convention.
- This sample is **editorial** work; the **interpreter** must stay valid when a file contains **more than one H1** (see §3.2).

### 1.3 Links on the rest of the site

**No automatic edits** to existing “instruction” links in views or footer. When the new reader ships, the team will **manually** point those links to the new route (or keep Drive links—**their** choice per surface).

---

## 2. Storing manuals and images (`src/assets`)

**Adopted:**

- **Sources** under **`src/assets/game-manuals/`** (or `src/manuals/`), versioned with the app.
- **Images** in co-located folders (e.g. `obozy-mayhem-manual.assets/`), resolved at build to **correct public URLs** (webpack `require` context, or a single `base` passed into the engine—**one** rule, **documented** in the author `*.md` guide).
- **CI check:** fail on unresolved `![](...)`.

`public/` is **not** the default; only revisit if a manual becomes huge or must be hot-swapped without rebuild.

### 2.1 Build-time compilation and static output

- **Input:** `*.md` (and co-located assets) under `src/assets/...` as now.
- **When:** the **unified** / **remark** / **rehype** engine runs **only in Node** during **`vue-cli-service build`** (and **`serve`** for dev, so the app matches production).
- **Output:** versioned **IR** as **static data** (e.g. one JSON per manual, or a generated `.js` that exports IR)—**imported** by the manual Vue view. The **browser bundle does not** need to include the full parser stack (unless you deliberately keep a small dev-only path; default is **no**).
- **Why:** manuals do **not** change at runtime; **Netlify** serves a **static** build; **client-side** parsing would bloat the bundle, duplicate work, and fight the “single static deploy” model.
- **Routing:** the SPA still uses **vue-router** (lazy view chunk); **data** is static assets produced at build, not fetched as raw `.md` for parsing on the device.

---

## 3. Information architecture: headings, parts, and first tile

### 3.1 Target semantics (updated)

| Markdown | Intended UI | Notes |
|----------|-------------|--------|
| **First H1 + following content** | **Cover / info tile** (first H2 in IR terms may be a synthetic “intro” or the H1 block maps to a **special first tile**—implementation detail) | YAML **`title`**: **short, simple** document name for chrome and **first-tile** heading. The **flesh under the first H1** (until the next heading) **fills** the first tile, styled **differently** (distinct hero/intro). |
| **H1 (each occurrence)** | **Part / chapter** — each H1 starts a **new segment** and its own **vertical stack of H2** tiles. A **subsequent H1** can use a **second “cover”**-style block (text under that H1 until the first H2) so it reads like a **new chapter opening**, but global chrome (**document `title`**, **logo**, breadcrumb) keeps it **obviously the same guide**. The **first** H1 is still the **primary** document intro (strongest “hero” treatment if you want a visual hierarchy). |
| **H2** | **One phone “screen”** — the **gum-snap** unit (§7.1) | In-scroll content **inside** the tile (nested scroll). |
| **H3** | Subsection: horizontal Swiper strip **or** “show all” via **HTML comment** metadata | — |
| **H4+** | Nested under parent; **no** extra nav by default | — |
| **In-doc** `[text](#id)` | Jump to the correct **H2** / **H3** after IR lookup | Id algorithm **=** slug strategy used everywhere. |
| **Tags** | **`<!-- manual:key value -->`** (or agreed keys) **above** a block/heading | **No** `^` prefix. **Configurable** tag vocabulary in engine schema. |
| **GitHub alerts** | `> [!NOTE]` etc. | Keep via remark pipeline (§5). |
| **Glossary** | `[term](glossary:slug)` + definitions in **front matter** and/or **footnotes** (§4.4, §4.5) | — |

### 3.2 Multiple H1s (must not break)

- Parsing produces **one ordered list of “parts”**. Each part starts at an **H1** and contains **H2…H6** content until the next H1.
- A **second (or later) H1** = **new part** = **another** full vertical “deck” of H2 snaps (and its own H3 carousels as needed), optionally introduced by a **chapter-style** block (content under that H1 before the first H2)—same **cover-tile** pattern as the document open, with styling that signals **“next chapter, same book”** (not a different app).
- The UI should **reuse** metadata across parts: **YAML `title`**, optional **`logo`**, and a **part index / name** (from the H1 text) so users never think they left the manual.
- **IR** should mirror this: e.g. `parts[]`, each with `title`, `slug`, **`cover?`** (html or md slice for the intro), `tiles[]` (H2), and optional **`useCoverLayout: true`** if the H1 has body before first H2.

### 3.3 Title tile, `logo`, and `title` in YAML

- **`title` (front matter):** **short** label for the **app bar** and for **document identity** across all parts (e.g. “Mayhem”, “Obozy – Mayhem”).
- **`logo` (front matter, optional):** path under the manual’s asset folder (or absolute app path after build) to a **small** image—used on **cover / title** tiles, in a **list of guides**, or as a **visual anchor** so each part’s intro still “belongs” to the same document. If omitted, the UI may show **no** icon or a **text-only** title.
- **First H1 in the file:** typically the **long** human title (e.g. `# OBOZY – MAYHEM`). The **text and blocks until the first H2** are the **body of the first tile** (metadata / intro), **visually** distinct (hero spacing, **logo** if set, maybe subtitle).
- **Later H1s:** the **same** `title` + `logo` (and same overall styling tokens) can introduce a **part cover** so chapter two **feels** like a new section while remaining **one** guide in one route.
- If authors omit a first H1 and only use `##`, the engine can treat **`title` from YAML** as the only title for the first tile—**document the fallback** in the author guide.

**Migration:** current manuals may use `##` for the first real section; editorial pass may add `#` for intro or restructure. **The interpreter** must not **crash** on “first heading is H2” (fallback: first tile = generated from `title` + first chunk).

---

## 4. Author-facing extensions (standard Markdown + comments)

**Design principle:** **maximum** compatibility with **GitHub Flavored / Typora** habits; **no** Pandoc-style `::: block` in v1 (see **§4.2**). Power features live in **HTML comments** and **front matter**, which **don’t** render in most Markdown previewers (comments hidden) and stay **valid** Markdown.

### 4.1 YAML front matter

- **`title`** (short), optional **`description`**, optional **`logo`** (path to image for guide identity / cover tiles; see **§3.3**), **`manualSchema`**, **glossary map** (optional duplicate of footnote defs—pick **one** source of truth per term to avoid drift; see **§4.5**), etc.
- Parsed with **`gray-matter`** or **remark-frontmatter** (unified), **at build time** only (§2.1).

### 4.2 Why not Pandoc / `:::` blocks (for this team)

- **Not “line numbers”**—directives are **wrap markers** (`::: tag` … `:::`). The pain you want to avoid is **another syntax** to teach and to break previews.
- **We skip `:::` in v1.** Tags use **HTML comments**; body stays **pure** `#` / `##` / lists / alerts / links.

```html
<!-- manual:tag original -->
## Sposób walki
```

- Optional future: if comments become insufficient, add **`remark-directive`** later—**same** IR on the other side.

### 4.3 HTML comment tags (configurable)

- **Placed above** the block they modify (heading, paragraph, or fenced code).
- The engine defines an **allowlist** of keys and optional values (e.g. `h3:mode list`, `h3:label "Pokaż wszystkie klasy"`).
- Unknown keys: **warning** in dev / CI, not silent failure.

### 4.4 Glossary: `[term](glossary:slug)` (canonical)

- **Link handler** in the AST: `glossary:` is **not** `http`—a custom plugin rewrites to **span** + click handler, or to **router** query.
- Styling: distinct color / underline, **not** the same as external links.
- **Definitions** from:
  - **front matter** map, and/or
  - **footnote-style definitions** (§4.5).

### 4.5 Glossary: footnote syntax vs only front matter

| | **Front matter `glossary:` map** | **Markdown footnotes** `[^id]` + `[^id]: text` |
|---|----------------------------------|-----------------------------------------------|
| **Pros** | One place; easy to grep; good for many terms | Familiar to academic writers; **standard** in many MD flavors; can live **next to** first use in source |
| **Cons** | Far from in-text usage; duplicating term string | Renders in some previews as “list at bottom”; on **mobile** footnote **numbers** can feel like **citations**, not “tap to define”; you must **unify** UX (both open the **same** bottom sheet) to avoid two behaviors |
| **Verdict** | **Primary** store for a **canonical** glossary table the app reads | **Optional** for authors who prefer writing defs at the bottom; the **engine** can **ingest** `[^x]:` lines into the same glossary table as YAML entries—**if** you implement that merge rule |

**Cons of mixing** without rules: the same term defined in **two** places. **Policy:** for each `slug`, **one** winning source (e.g. YAML overrides footnote, or first wins—**pick one** in implementation and document in author `*.md`).

**Footnotes for *general* notes** (unrelated to glossary) are **out of scope** in v1 unless you add a plugin—glossary footnotes are the **only** footnote use case initially, or you use **alerts** for asides.

### 4.6 Strip `[TOC]`

- Authors **delete** `[TOC]` from files.
- Engine: optional **pre-pass** to remove a line that is only `[TOC]` so old files don’t show garbage.

---

## 5. Parser: must be **fully extensible**

**Requirement:** own plugins, own transforms, and access to the **AST** (mdast/hast), not a fixed HTML string only.

**Recommendation (unchanged in spirit):** **unified** + **remark** + **rehype** as the **only** path for the manual engine.

| Piece | Package | Role |
|--------|---------|------|
| Core pipeline | `unified` | Pluggable transforms |
| MD → mdast | `remark-parse` | Parse |
| GFM | `remark-gfm` | Tables, strikethrough, etc. |
| Front matter | `remark-frontmatter` | YAML in MD |
| Alerts | `remark-github-blockquote-alert` (or current equivalent in the remark ecosystem) | `> [!NOTE]` |
| MD → HAST | `remark-rehype` | |
| Slugs | `rehype-slug` (or `github-slugger` in a custom pass) | Stable `#` anchors |
| Sanitize | `rehype-sanitize` | Safe HTML for any embedded markup |
| Custom | **Your plugins** | `glossary:` links, comment-tag extraction, part/H2 splitting → **IR** |

**Do not** depend on `markdown-it` for this pipeline—Quiz can stay on `markdown-it` until a deliberate migration.

**Execution context:** the entire pipeline in this section runs in **Node** at **build** (§2.1), not in the end-user browser.

---

## 6. Intermediate representation (IR)

- **Versioned** JSON (or equivalent static module) **emitted at build** and consumed by the Vue layer—**no** runtime Markdown parse.
- Structure includes **`parts`**, each with **`tiles` (H2)**, optional **`subsections` (H3)**, per-part **cover** slices if applicable, **document-level** `title` / **`logo`**, and a **`linkIndex`** for hashes.
- **Search (v1):** filter by **string** (tile titles + plaintext from IR) in the **lazy-loaded** manual chunk—**no** indexer; all strings come from the **prebuilt** IR.

**Security:** sanitize **all** rich HTML; glossary is plain text; **code blocks** are **plain** in v1 (no `highlight.js` required for first ship unless you add it).

---

## 7. Layout engine: H2 “gum” snap and H3 (Swiper)

### 7.1 Vertical: **one** mechanism (Swiper vs fullPage)

**Product:** outer vertical motion **should** end **aligned** to **one H2** (rubber / gum to the nearest screen), not stop mid-baseline between two H2s.

| Approach | In codebase | Verdict |
|----------|-------------|--------|
| **Swiper 8, `direction: 'vertical'`** | Already a dependency; used horizontally today | **Try first:** each **H2 = one vertical slide**; **inner** `div` is **`overflow-y: auto`** (long tile body). `nested: true` if H3 is another Swiper inside. **Pro:** one ecosystem; no new **scroll-hijack** library. **Con:** iOS + nested touch needs careful options and QA. |
| **fullPage.js** or **@fullpage/vue-fullpage** | New dependency; purpose-built for full-viewport scroll | **Only** if Swiper vertical fails product QA (jank, accessibility, or unmaintainable workarounds). **If added,** avoid **also** using Swiper for the **same** axis—**one** tool per direction to keep behavior predictable. |
| **CSS `scroll-snap` (mandatory, y)** | No new JS | **Fallback** for vertical snap if you drop JS snap entirely; may still need JS for **hash** and **progress**. |

**Decided process:** implement **Swiper vertical for H2**; schedule **device QA**; document **“escape hatch”** to fullPage (or another lib) in one paragraph of ADR if needed.

**Note:** “Scroll hijack” in marketing language often = **this** snap behavior. **Swiper** is not *only* a carousel; it’s a **scroll container with controlled translation**—functionally the same *category* as fullPage for “one panel per H2” if configured that way. **Do not** add a second full-page library for the same axis without removing the first.

### 7.2 H3 horizontal

- **Swiper** horizontal for H3 under each H2 (existing dependency).
- **Touch:** parent vertical Swiper + child horizontal = enable **`nested: true`**, test on Android and iOS.

### 7.3 Comment-driven “show all” for H3

- When **`<!-- manual:h3:mode list -->`** (or similar), list **H3** titles; tap opens the tile’s subsection—same IR, different view.

### 7.4 Progress and deep links

- **Progress bar:** combine **active vertical slide index** with **inner** scroll ratio if you want fine granularity (product choice).
- **Router:** `scrollBehavior` in `index.js` may need a **exception** for manual routes so the global `scroll #app` doesn’t fight the reader (implementation detail when coding).

### 7.5 Lazy route and static data

- **Vue Router:** `component: () => import('@/views/ManualView.vue')` (name TBD).
- **Data:** the view imports **prebuilt IR** (or a small generated module that re-exports JSON) from the build output—**not** a runtime `import` of raw `.md` for parsing in the client.

---

## 8. UI/UX (mobile-first, Materialize)

- Fixed header, reader fills `100% - header` with **`min-height: 0` / flex** fix.
- Glossary: tap → **bottom sheet** (Materialize modal styled to bottom).
- **Search:** in v1, **search field + filter** over loaded IR (or concatenated text); show matches as **jumps to tile** (no server).

---

## 9. Critical libraries — **doc links for you to collect**

Bring official docs (or the GitHub repo README) for each. Placeholders use **ecosystem names**; pin **exact versions** at install time.

| # | Library | What to read | Typical doc entry point (verify at install) |
|---|---------|----------------|---------------------------------------------|
| 1 | **unified** | Core pipeline, plugins | https://unifiedjs.com/ |
| 2 | **remark** (meta) | Ecosystem | https://remark.js.org/ |
| 3 | **remark-parse** | MD → mdast | https://github.com/remarkjs/remark/tree/main/packages/remark-parse |
| 4 | **remark-gfm** | GFM on mdast | https://github.com/remarkjs/remark-gfm |
| 5 | **remark-frontmatter** | YAML block | https://github.com/remarkjs/remark-frontmatter |
| 6 | **remark-rehype** | mdast → hast | https://github.com/remarkjs/remark-rehype |
| 7 | **rehype-sanitize** | HTML hardening | https://github.com/rehypejs/rehype-sanitize |
| 8 | **rehype-slug** (or rehype-autolink-headings) | Heading ids for `#` | https://github.com/rehypejs/rehype-slug |
| 9 | **remark-github-blockquote-alert** (or maintained fork) | `> [!NOTE]` | Search npm for **remark** + **github** + **alert**; confirm compatibility with your `remark-gfm` version |
| 10 | **github-slugger** | If custom slug logic is needed | https://github.com/Flet/github-slugger |
| 11 | **gray-matter** (optional if front matter fully handled by remark) | String split | https://github.com/jonschlinkert/gray-matter |
| 12 | **Swiper 8** | Vertical + horizontal + `nested` | https://swiperjs.com/ (Vue, modules you use) |
| 13 | **Vue Router 4** | Lazy routes, `scrollBehavior` | https://router.vuejs.org/ |
| 14 | **Vue 3** | Composition / SFC (if you adopt in manual view) | https://vuejs.org/ |
| 15 | **Materialize CSS** (1.x RC) | Modals, grid, waves | https://materializecss.com/ |

**Optional / later:** `highlight.js` or **Shiki** (only if code blocks get syntax colors); **flexsearch** / **minisearch** (client-side index for search v2). **DOMPurify** only if a **string-HTML** path remains; prefer **rehype-sanitize** in unified.

---

## 10. Phased delivery

| Phase | Output | Criterion to advance |
|-------|--------|------------------------|
| **0** | IR v1, **author’s `authoring-guide.md`**, 1 golden fixture | Heading + multi-H1 + comments + `logo` agreed |
| **1** | **Build-time** **MD → IR** (Node) + tests + **webpack/CLI hook** to emit static files | GFM, alerts, `glossary:` link, no `^` |
| **2** | Lazy **Vue** manual view + **Swiper vertical** H2 + inner scroll | “Gum” feel on real devices |
| **3** | H3 **Swiper**, deep links, progress, **glossary** sheet | iOS + Android |
| **4** | **Search** UI (client filter), `meta` / OG if needed | — |

**Reusable package:** e.g. `@obozy/manual-engine` (parsing only); Vue is a **thin** shell.

---

## 11. How to validate libraries (fishing rod)

1. **Golden** `.md` cases: two H1s, H2 snap targets, `> [!NOTE]`, `[a](glossary:x)`, `<!-- manual:... -->`, image, code block.
2. In CI: **mdast snapshot** or **IR snapshot**; **no** golden DOM.
3. On device: **vertical Swiper** + **inner scroll** + **horizontal** child—one failing gesture = adjust options or revisit §7.1 escape hatch.

---

## 12. Conclusion

- **unified + remark + rehype** ( **build-time only** ) for a **truly extensible** parser; **static IR** in the middle; **Materialize** + **Swiper** (vertical H2, horizontal H3) without **Bulma**; **glossary:** `[term](glossary:slug)`; **tags:** **HTML comments**; **no** `^`, **no** `[TOC]`; **title** + optional **`logo`** in YAML; **H1** parts with optional **chapter-style** covers; **second+ H1** = new part, **same** document; **Swiper first** for gum-snap, **fullPage-class** only on failure; **links on site and GDrive** left to team policy; **route lazy** for **view**, **static** data; **search** UI first; **author guide** in Markdown; **Netlify**-friendly **static** deploy.

**First code:** **IR + parser** + tests—not the full UI.

When you have **pasted or bookmarked** the official docs for the table in **§9**, use them to pin versions and plugin compatibility (especially `remark-gfm` + **alert** plugin + **rehype-sanitize**).
