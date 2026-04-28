/**
 * Build-time Markdown → IR JSON (PLAN.md).
 * Run: node scripts/build-manuals.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import remarkRehype from 'remark-rehype'
import remarkGitHubAlert from 'remark-github-blockquote-alert'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { VFile } from 'vfile'

function mdastToMd (nodes) {
  if (!nodes || !nodes.length) return ''
  return String(
    unified()
      .use(remarkGfm)
      .use(remarkStringify)
      .stringify(/** @type {import('mdast').Root} */ ({ type: 'root', children: nodes }))
  )
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const warn = (m) => console.warn(`[build-manuals] ${m}`)

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'div', 'span', 'svg', 'path', 'g', 'details', 'summary'],
  attributes: {
    ...defaultSchema.attributes,
    div: ['className', 'class', 'dir'],
    span: ['className', 'class', 'dir', 'dataGlossary', 'dataTag', 'role', 'tabIndex'],
    a: ['href', 'title', 'className', 'class', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'className', 'class', 'style'],
    code: ['className', 'class'],
    pre: ['className', 'class'],
    table: ['className', 'class'],
    th: ['colspan', 'rowspan', 'align', 'className', 'class'],
    td: ['colspan', 'rowspan', 'align', 'className', 'class'],
    svg: ['viewBox', 'width', 'height', 'fill', 'className', 'class', 'xmlns', 'focusable', 'aria-hidden'],
    path: ['d', 'fill', 'className', 'class'],
    g: ['className', 'class'],
    details: ['open', 'className', 'class'],
    summary: ['className', 'class']
  }
}

/**
 * Wraps H4, H5, H6 heading+content groups into <details>/<summary> elements,
 * making them collapsible accordion items. The heading text becomes the
 * <summary>; everything up to the next heading of equal/higher rank becomes
 * the details body.
 *
 * Opt-in expansion: if the MDAST heading had <!-- manual:expand true -->
 * before it, remark-rehype will have forwarded data-manual-expand="true" onto
 * the hast element. We read that attribute and add the `open` attribute to
 * <details> to default it to open.
 */
function rehypeAccordion () {
  return (/** @type {import('hast').Root} */ tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    // Visit both 'root' and 'element' nodes — in a fragment pipeline the h4/h5/h6
    // nodes are direct children of root (not wrapped in a body element), so we
    // must process root's own children array as well.
    visit(tree, ['root', 'element'], (node) => {
      if (!Array.isArray(node.children)) return
      const newChildren = []
      let i = 0
      while (i < node.children.length) {
        const child = node.children[i]
        if (
          child.type === 'element' &&
          /^h[456]$/.test(child.tagName)
        ) {
          const level = parseInt(child.tagName[1], 10)
          // Collect subsequent sibling nodes until the next heading ≤ this level
          const bodyNodes = []
          let j = i + 1
          while (j < node.children.length) {
            const sibling = node.children[j]
            if (
              sibling.type === 'element' &&
              /^h[1-6]$/.test(sibling.tagName) &&
              parseInt(sibling.tagName[1], 10) <= level
            ) break
            bodyNodes.push(sibling)
            j++
          }
          // rehypeRaw normalises data-* attributes to camelCase (data-manual-expand → dataManualExpand)
          const expand = child.properties && (
            child.properties['data-manual-expand'] === 'true' ||
            child.properties['dataManualExpand'] === 'true'
          )
          // Remove the metadata attribute from summary so it doesn't appear in HTML
          if (child.properties) {
            delete child.properties['data-manual-expand']
            delete child.properties['dataManualExpand']
          }
          // Wrap heading text in a <summary> and nest in <details>
          const details = {
            type: 'element',
            tagName: 'details',
            properties: { ...(expand ? { open: true } : {}), className: ['manual-accordion'] },
            children: [
              {
                type: 'element',
                tagName: 'summary',
                properties: { className: ['manual-accordion__summary'] },
                children: child.children
              },
              ...bodyNodes
            ]
          }
          newChildren.push(details)
          i = j
        } else {
          newChildren.push(child)
          i++
        }
      }
      node.children = newChildren
    })
  }
}

/** Classify links into four types by adding a CSS class:
 *  - `#slug`       → manual-ref-link  (in-document navigation)
 *  - `http(s)://`  → manual-ext-link  (external URL)
 *  - `glossary:`   → manual-glossary-term (handled separately below)
 *  - `tag:`        → manual-tag-inline (inline paragraph tag badge)
 *  External links also get target="_blank" and rel="noopener noreferrer".
 *  `tags` is the record from meta.tags – used to inject the correct icon into
 *  inline tag spans.
 *
 * @param {Record<string, { icon: string, label: string, description: string }>} [tags]
 */
function rehypeLinkClasses (tags) {
  return (/** @type {import('hast').Root} */ tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a' || !node.properties) return
      const href = node.properties.href
      if (typeof href !== 'string') return
      if (href.startsWith('glossary:')) return // handled by rehypeGlossaryLinks
      const cls = Array.isArray(node.properties.className) ? node.properties.className : []
      if (href.startsWith('tag:')) {
        const tagKey = href.replace(/^tag:/, '')
        const tagDef = (tags || {})[tagKey]
        node.tagName = 'span'
        node.properties = {
          className: ['manual-tag-inline'],
          dataTag: tagKey,
          role: 'button',
          tabIndex: '0'
        }
        if (tagDef?.icon) {
          node.children = [
            ...node.children,
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['material-icons', 'manual-tag-inline__icon'], ariaHidden: 'true' },
              children: [{ type: 'text', value: tagDef.icon }]
            }
          ]
        }
        return
      }
      if (href.startsWith('#')) {
        node.properties.className = [...cls, 'manual-ref-link']
      } else if (/^https?:\/\//.test(href) || href.startsWith('//')) {
        node.properties.className = [...cls, 'manual-ext-link']
        node.properties.target = '_blank'
        node.properties.rel = ['noopener', 'noreferrer']
      }
    })
  }
}

function rehypeGlossaryLinks () {
  return (/** @type {import('hast').Root} */ tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a' || !node.properties) return
      const href = node.properties.href
      if (typeof href !== 'string' || !href.startsWith('glossary:')) return
      // Markdown parsers URL-encode non-ASCII hrefs; decode so the slug matches
      // the YAML front matter key (e.g. "ołtarz", not "o%C5%82tarz").
      const slug = decodeURIComponent(href.replace(/^glossary:/, ''))
      node.tagName = 'span'
      node.properties = {
        className: ['manual-glossary-term'],
        dataGlossary: slug
      }
    })
  }
}

/**
 * Converts block elements annotated with `data-manual-tag` into content
 * prefixed with a clickable badge chip showing the tag's icon and label.
 * Clicking the badge in the Vue component opens an info modal that shows
 * the full description from meta.tags.
 *
 * @param {Record<string, { icon: string, label: string, description: string }>} tags
 */
function rehypeTagBadges (tags) {
  return (tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, ['root', 'element'], (node) => {
      if (!Array.isArray(node.children)) return
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        if (child.type !== 'element' || !child.properties) continue
        // rehypeRaw normalises data-* attributes to camelCase; accept both forms
        const tagKey = child.properties['data-manual-tag'] || child.properties['dataManualTag']
        if (!tagKey) continue
        const tagDef = (tags || {})[tagKey]
        delete child.properties['data-manual-tag']
        delete child.properties['dataManualTag']
        if (!tagDef) continue
        const badge = {
          type: 'element',
          tagName: 'span',
          properties: {
            className: ['manual-tag-badge'],
            dataTag: tagKey,
            role: 'button',
            tabIndex: '0'
          },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['material-icons', 'manual-tag-badge__icon'], ariaHidden: 'true' },
              children: [{ type: 'text', value: tagDef.icon || 'label' }]
            },
            // Omit the label span when label is explicitly empty string (icon-only pill)
            ...(tagDef.label !== ''
              ? [{
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['manual-tag-badge__label'] },
                  children: [{ type: 'text', value: tagDef.label || tagKey }]
                }]
              : [])
          ]
        }

        // If the tagged element is a paragraph, find the nearest preceding heading
        // sibling and badge that instead — the heading is what the user sees first.
        // When no heading exists in this HTML fragment (H2/H3 title was stripped
        // into the IR title field), skip — the Vue template uses tile.tagKey instead.
        const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if (child.tagName === 'p') {
          let headingTarget = null
          for (let j = i - 1; j >= 0; j--) {
            const sib = node.children[j]
            if (sib.type === 'element' && HEADING_TAGS.has(sib.tagName)) {
              headingTarget = sib
              break
            }
          }
          if (!headingTarget) continue // handled by IR-level tagKey
          headingTarget.children = [...headingTarget.children, badge]
        } else {
          // For non-paragraph elements (headings etc.) append directly
          child.children = [...child.children, badge]
        }
      }
    })
  }
}

/**
 * Normalises image size hints added by Typora (style="zoom:X%") and other
 * width / height style overrides into standard CSS max-width so sanitize keeps
 * them. Runs before rehypeSanitize.
 */
function rehypeImageSize () {
  return (tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || !node.properties) return
      const style = node.properties.style
      if (typeof style !== 'string') return
      // Typora exports `style="zoom:25%;"` – convert to CSS max-width
      const zoomMatch = style.match(/zoom:\s*(\d+(?:\.\d+)?)%/)
      if (zoomMatch) {
        node.properties.style = `max-width:${zoomMatch[1]}%;height:auto`
      }
    })
  }
}

/**
 * @param {import('hast').Root} tree
 * @param {{ sourceDir: string, destDir: string, publicPathPrefix: string }} ctx
 */
function rehypeRewriteLocalImgs (ctx) {
  return (tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || !node.properties) return
      const src = node.properties.src
      if (typeof src !== 'string' || /^(https?:|\/\/|data:)/.test(src)) return
      const clean = decodeURIComponent(src.split('?')[0].replace(/^\.\//, ''))
      const abs = path.resolve(ctx.sourceDir, clean)
      if (!fs.existsSync(abs)) {
        warn(`Missing image: ${abs} (from ${ctx.sourceDir})`)
        return
      }
      fs.mkdirSync(ctx.destDir, { recursive: true })
      const base = path.basename(abs)
      const dest = path.join(ctx.destDir, base)
      fs.copyFileSync(abs, dest)
      const publicPath = `/${ctx.publicPathPrefix}/${base}`.replace(/\/+/g, '/')
      node.properties.src = publicPath
    })
  }
}

/**
 * Remark plugin: processes `<!-- manual:key value -->` HTML comment nodes in the
 * MDAST, attaches the key/value as hProperties on the NEXT sibling, then removes
 * the comment. Used inside mdastToHtml so that metadata re-inserted from
 * data.hProperties survives the markdown round-trip.
 */
function remarkManualMeta () {
  return (/** @type {import('mdast').Root} */ tree) => {
    if (!tree.children) return
    const kept = []
    for (let i = 0; i < tree.children.length; i++) {
      const n = tree.children[i]
      if (
        n.type === 'html' &&
        /** @type {import('mdast').Html} */ (n).value?.trim().match(/<!--\s*manual:/)
      ) {
        const match = /** @type {import('mdast').Html} */ (n).value
          .trim()
          .match(/<!--\s*manual:(\w+)\s+(.+?)\s*-->/)
        if (match) {
          const next = tree.children[i + 1]
          if (next) {
            next.data = next.data || {}
            next.data.hProperties = /** @type {Record<string,string>} */ (next.data.hProperties || {})
            next.data.hProperties[`data-manual-${match[1]}`] = match[2]
          }
        }
        continue
      }
      kept.push(n)
    }
    tree.children = kept
  }
}

/**
 * @param {import('mdast').Node[]} nodes
 * @param {{ sourceDir: string, destDir: string, publicPathPrefix: string }} rewrite
 */
async function mdastToHtml (nodes, rewrite) {
  if (!nodes || !nodes.length) return ''
  // Re-insert manual:* metadata as HTML comments before the markdown round-trip.
  // The initial MDAST scan attaches them as data.hProperties on the next sibling,
  // but remark-stringify drops data.* fields. By re-inserting raw comments here,
  // remarkManualMeta can pick them up again after re-parsing.
  const augmented = []
  for (const n of nodes) {
    if (n.data?.hProperties) {
      for (const [key, val] of Object.entries(
        /** @type {Record<string,string>} */ (n.data.hProperties)
      )) {
        const m = key.match(/^data-manual-(\w+)$/)
        if (m) augmented.push({ type: 'html', value: `<!-- manual:${m[1]} ${val} -->` })
      }
    }
    augmented.push(n)
  }
  const md = mdastToMd(augmented)
  if (!md.trim()) return ''
  const vfile = new VFile({ value: md, data: { rewrite } })
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGitHubAlert)
      .use(remarkManualMeta)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypeAccordion)
      .use(rehypeLinkClasses, rewrite.tags || {})
      .use(rehypeGlossaryLinks)
      .use(rehypeTagBadges, rewrite.tags || {})
      .use(rehypeImageSize)
      .use(rehypeRewriteLocalImgs, rewrite)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeStringify)
      .process(vfile)
  )
}

function stripTocLine (md) {
  return md
    .split('\n')
    .filter((l) => !/^\[TOC\]\s*$/i.test(l.trim()))
    .join('\n')
}

/**
 * @param {import('mdast').Node[]} block
 */
function splitH2Blocks (block) {
  const tiles = /** @type {import('mdast').Node[][] */ ([])
  if (!block.length) return []
  const firstH2 = block.findIndex(
    (n) => n.type === 'heading' && (/** @type {import('mdast').Heading} */ (n)).depth === 2
  )
  if (firstH2 === -1) return []
  for (let i = firstH2; i < block.length; i++) {
    const n = block[i]
    if (n.type !== 'heading' || (/** @type {import('mdast').Heading} */ (n)).depth !== 2) continue
    const j = i + 1
    let k = j
    for (; k < block.length; k++) {
      const c = block[k]
      if (c.type === 'heading' && (/** @type {import('mdast').Heading} */ (c)).depth === 1) break
      if (c.type === 'heading' && (/** @type {import('mdast').Heading} */ (c)).depth === 2) break
    }
    tiles.push([n, ...block.slice(j, k)])
    i = k - 1
  }
  return tiles
}

/**
 * @param {import('mdast').Node[]} tileWithH2
 * @param {import('github-slugger').default} g
 */
function splitTileToSubsections (tileWithH2, g) {
  if (!tileWithH2.length) {
    return { id: 'tile', title: '', contentHtml: '', introHtml: null, subsections: null }
  }
  const h2 = /** @type {import('mdast').Heading} */ (tileWithH2[0])
  const title = toString(h2)
  const id = g.slug(title)
  const rest = tileWithH2.slice(1)
  if (!rest.length) {
    return { id, title, contentHtml: '<p></p>', introHtml: null, subsections: null }
  }
  const h3i = rest.findIndex(
    (n) => n.type === 'heading' && (/** @type {import('mdast').Heading} */ (n)).depth === 3
  )
  if (h3i === -1) {
    return { id, title, contentHtml: null, _body: rest, introHtml: null, subsections: null }
  }
  const introNodes = h3i > 0 ? rest.slice(0, h3i) : null
  const fromH3 = h3i === 0 ? rest : rest.slice(h3i)
  const sub = /** @type { { id: string, title: string, nodes: import('mdast').Node[] }[] } */ ([])
  for (let i = 0; i < fromH3.length; i++) {
    const n = fromH3[i]
    if (n.type !== 'heading' || (/** @type {import('mdast').Heading} */ (n)).depth !== 3) continue
    const t3 = toString(n)
    const id3 = g.slug(t3)
    const j = i + 1
    let k = j
    for (; k < fromH3.length; k++) {
      const c = fromH3[k]
      if (c.type === 'heading' && (/** @type {import('mdast').Heading} */ (c)).depth === 3) break
    }
    sub.push({ id: id3, title: t3, nodes: fromH3.slice(j, k) })
    i = k - 1
  }
  return { id, title, introHtml: introNodes, subsections: sub, _body: null, contentHtml: null }
}

async function buildOneManual (manual) {
  const { id, source: rel } = manual
  const abs = path.join(projectRoot, rel)
  if (!fs.existsSync(abs)) {
    throw new Error(`Manual source not found: ${abs}`)
  }
  const raw = fs.readFileSync(abs, 'utf8')
  const stripped = stripTocLine(raw)
  const { data: front, content } = matter(stripped)
  const meta = {
    title: front.title || id,
    description: front.description || '',
    logo: front.logo || null,
    logoUrl: null,
    related: Array.isArray(front.related) ? front.related : [],
    tags: (front.tags && typeof front.tags === 'object')
      ? Object.fromEntries(
          Object.entries(front.tags).map(([k, v]) => [
            k,
            {
              icon: String((v && v.icon) || 'label'),
              label: String((v && v.label) || k),
              description: String((v && v.description) || '')
            }
          ])
        )
      : {},
    glossary: (front.glossary && typeof front.glossary === 'object')
      ? Object.fromEntries(
          Object.entries(front.glossary).map(([k, v]) => [
            k,
            typeof v === 'string'
              ? { definition: v, link: null, display: null }
              : {
                  definition: String(v.definition || ''),
                  link: v.link || null,
                  display: (v.display != null) ? String(v.display) : null
                }
          ])
        )
      : {}
  }

  const sourceDir = path.dirname(abs)
  const publicPathPrefix = `manual-assets/${id}`.replace(/\\/g, '/')
  const destDir = path.join(projectRoot, 'public', 'manual-assets', id)
  const rewrite = { sourceDir, destDir, publicPathPrefix, tags: meta.tags }
  const globalSlug = new GithubSlugger()
  const linkIndex = /** @type {Record<string, { part: number, tile: number, subsection?: number }>} */ ({})

  const proc = /** @type {import('unified').Processor} */ (unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkGitHubAlert))
  const root = /** @type {import('mdast').Root} */ (proc.parse(content))
  // Process <!-- manual:key value --> comments: attach as hProperties on the
  // NEXT sibling so rehype plugins can read them, then remove the comment.
  if (root.children) {
    const kept = []
    for (let i = 0; i < root.children.length; i++) {
      const n = root.children[i]
      if (
        n.type === 'html' &&
        /** @type {import('mdast').Html} */ (n).value &&
        (/** @type {import('mdast').Html} */ (n).value).trim().startsWith('<!')
      ) {
        const match = (/** @type {import('mdast').Html} */ (n)).value
          .trim()
          .match(/<!--\s*manual:(\w+)\s+(.+?)\s*-->/)
        if (match) {
          // Find the next real node and attach metadata via data.hProperties
          const next = root.children[i + 1]
          if (next) {
            next.data = next.data || {}
            next.data.hProperties = /** @type {Record<string,string>} */ (next.data.hProperties || {})
            next.data.hProperties[`data-manual-${match[1]}`] = match[2]
          }
        }
        // Always drop the comment itself
        continue
      }
      kept.push(n)
    }
    root.children = kept
  }

  const children = root.children || []
  const h1Indices = children
    .map((c, i) => (c.type === 'heading' && (/** @type {import('mdast').Heading} */ (c)).depth === 1 ? i : -1))
    .filter((i) => i >= 0)

  /** @type {{ id: string, title: string, coverHtml: string, tiles: any[] }[]} */ const parts = []

  /**
   * @param {import('mdast').Node[]} trec
   * @param {number} partIdx
   * @param {number} tileIdx
   */
  /**
   * Read the tag key off the first MDAST content node, if the author placed
   * a `<!-- manual:tag X -->` comment before it. Returns null if absent.
   * @param {import('mdast').Node[]} nodes
   */
  const extractSectionTag = (nodes) => {
    const first = nodes && nodes[0]
    return (first && first.data && first.data.hProperties &&
      (first.data.hProperties['data-manual-tag'] || null)) || null
  }

  const buildTile = async (trec, partIdx, tileIdx) => {
    const g = new GithubSlugger()
    const s = splitTileToSubsections(trec, g)
    if (s._body) {
      const tagKey = extractSectionTag(s._body)
      const html = await mdastToHtml(s._body, rewrite)
      linkIndex[s.id] = { part: partIdx, tile: tileIdx }
      return {
        id: s.id,
        title: s.title,
        tagKey: tagKey || null,
        introHtml: null,
        subsections: null,
        contentHtml: html
      }
    }
    if (s.subsections) {
      const intro =
        s.introHtml && s.introHtml.length
          ? await mdastToHtml(s.introHtml, rewrite)
          : null
      const subsections = []
      for (let si = 0; si < s.subsections.length; si++) {
        const sub = s.subsections[si]
        const tagKey = extractSectionTag(sub.nodes)
        const html = await mdastToHtml(sub.nodes, rewrite)
        linkIndex[sub.id] = { part: partIdx, tile: tileIdx, subsection: si }
        subsections.push({ id: sub.id, title: sub.title, tagKey: tagKey || null, html })
      }
      linkIndex[s.id] = { part: partIdx, tile: tileIdx }
      return {
        id: s.id,
        title: s.title,
        tagKey: extractSectionTag(s.introHtml || []) || null,
        introHtml: intro,
        subsections,
        contentHtml: null
      }
    }
    return { id: s.id, title: s.title, tagKey: null, subsections: null, contentHtml: '<p></p>' }
  }

  if (h1Indices.length === 0) {
    const h2s = splitH2Blocks(children)
    const tiles = []
    for (let tix = 0; tix < h2s.length; tix++) {
      const t = await buildTile(h2s[tix], 0, tix)
      tiles.push(t)
    }
    parts.push({
      id: 'doc',
      title: meta.title,
      coverHtml: '',
      tiles
    })
  } else {
    for (let p = 0; p < h1Indices.length; p++) {
      const start = h1Indices[p]
      const end = p + 1 < h1Indices.length ? h1Indices[p + 1] : children.length
      const partSlice = children.slice(start, end)
      const h1 = /** @type {import('mdast').Heading} */ (partSlice[0])
      const partTitle = toString(h1)
      const partId = globalSlug.slug(partTitle)
      const afterH1 = partSlice.slice(1)
      const h2i = afterH1.findIndex(
        (n) => n.type === 'heading' && (/** @type {import('mdast').Heading} */ (n)).depth === 2
      )
      const coverNodes = h2i <= 0 ? [] : afterH1.slice(0, h2i)
      const h2Block = h2i === -1 ? [] : afterH1.slice(h2i)
      const coverHtml = coverNodes.length ? await mdastToHtml(coverNodes, rewrite) : ''
      const h2s = splitH2Blocks(h2Block)
      const tiles = []
      for (let tix = 0; tix < h2s.length; tix++) {
        const t = await buildTile(h2s[tix], parts.length, tix)
        tiles.push(t)
      }
      parts.push({ id: partId, title: partTitle, coverHtml, tiles })
    }
  }

  if (meta.logo) {
    const lpath = path.resolve(sourceDir, String(meta.logo).replace(/^\.\//, ''))
    if (fs.existsSync(lpath)) {
      fs.mkdirSync(destDir, { recursive: true })
      const b = path.basename(lpath)
      fs.copyFileSync(lpath, path.join(destDir, b))
      meta.logoUrl = `/${publicPathPrefix}/${b}`.replace(/\/+/g, '/')
    } else {
      warn(`logo not found: ${lpath}`)
    }
  }

  return { schemaVersion: 1, id, meta, parts, linkIndex }
}

/**
 * Wraps a build error with context about which manual file caused it. For
 * YAMLException (from js-yaml via gray-matter) we extract the line/column
 * inside the front matter and translate it back to a file-relative line so
 * authors can jump straight to the offending entry.
 *
 * gray-matter's YAML buffer is prefixed with the newline after `---`, so the
 * 0-indexed `mark.line` lines up with the 1-indexed file line directly.
 */
function enrichManualError (err, manual) {
  const file = manual.source
    ? path.relative(projectRoot, path.join(projectRoot, manual.source))
    : `manual ${manual.id}`

  if (err && err.name === 'YAMLException' && err.mark) {
    const fileLine = (err.mark.line ?? 0) + 1
    const col = (err.mark.column ?? 0) + 1
    const reason = err.reason || err.message
    const wrapped = new Error(
      `Front matter error in ${file} (line ${fileLine}, column ${col}): ${reason}`
    )
    wrapped.cause = err
    return wrapped
  }
  if (err && err.message) {
    err.message = `Error building ${file}: ${err.message}`
  }
  return err
}

async function main () {
  const isProd = process.env.NODE_ENV === 'production'
  const cfgPath = path.join(projectRoot, 'manuals.config.json')
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  if (!cfg.manuals?.length) {
    console.warn('No manuals in manuals.config.json')
    return
  }
  const outDir = path.join(projectRoot, 'src', 'data', 'manual-ir')
  fs.mkdirSync(outDir, { recursive: true })

  /** @type {{ id: string, title: string, description: string }[]} */
  const builtMeta = []

  for (const m of cfg.manuals) {
    if (m.devOnly && isProd) {
      console.log(`Skipped dev-only manual: ${m.id}`)
      continue
    }
    let ir
    try {
      ir = await buildOneManual(m)
    } catch (err) {
      throw enrichManualError(err, m)
    }
    const out = path.join(outDir, `${m.id}.json`)
    fs.writeFileSync(out, JSON.stringify(ir, null, 2), 'utf8')
    console.log(`Wrote ${path.relative(projectRoot, out)}`)
    builtMeta.push({ id: m.id, title: ir.meta.title, description: ir.meta.description })
  }

  // Write manuals-meta.js for the Netlify edge function so it can serve per-manual OG tags.
  const metaEntries = builtMeta
    .filter((m) => !m.id.startsWith('authoring')) // skip internal dev guides
    .map((m) => {
      const title = `${m.title} | Instrukcja | Obozy - Gra Terenowa`
      const desc = m.description || 'Interaktywna instrukcja gry terenowej Obozy.'
      return `  ${JSON.stringify(m.id)}: { title: ${JSON.stringify(title)}, description: ${JSON.stringify(desc)} }`
    })
    .join(',\n')
  const metaFile = `// Auto-generated by build:manuals — do not edit manually.\nexport const manualsMeta = {\n${metaEntries}\n}\n`
  // Placed outside edge-functions/ so Netlify does not treat it as an edge function.
  // og-inject.js imports it with a relative '../manuals-meta.js' path.
  const metaOut = path.join(projectRoot, 'netlify', 'manuals-meta.js')
  fs.writeFileSync(metaOut, metaFile, 'utf8')
  console.log(`Wrote ${path.relative(projectRoot, metaOut)}`)
}

main().catch((e) => {
  console.error(`[build-manuals] ${e.message}`)
  if (process.env.DEBUG && e.cause) console.error(e.cause)
  process.exit(1)
})
