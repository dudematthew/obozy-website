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
  tagNames: [...(defaultSchema.tagNames || []), 'div', 'span', 'svg', 'path', 'g'],
  attributes: {
    ...defaultSchema.attributes,
    div: ['className', 'class', 'dir'],
    span: ['className', 'class', 'dir', 'dataGlossary'],
    a: ['href', 'title', 'className', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'className', 'class'],
    code: ['className', 'class'],
    pre: ['className', 'class'],
    table: ['className', 'class'],
    th: ['colspan', 'rowspan', 'align', 'className', 'class'],
    td: ['colspan', 'rowspan', 'align', 'className', 'class'],
    svg: ['viewBox', 'width', 'height', 'fill', 'className', 'class', 'xmlns', 'focusable', 'aria-hidden'],
    path: ['d', 'fill', 'className', 'class'],
    g: ['className', 'class']
  }
}

function rehypeGlossaryLinks () {
  return (/** @type {import('hast').Root} */ tree) => {
    if (!tree || typeof tree !== 'object' || !('type' in tree)) return
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a' || !node.properties) return
      const href = node.properties.href
      if (typeof href !== 'string' || !href.startsWith('glossary:')) return
      const slug = href.replace(/^glossary:/, '')
      node.tagName = 'span'
      node.properties = {
        className: ['manual-glossary-term'],
        dataGlossary: slug
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
 * @param {import('mdast').Node[]} nodes
 * @param {{ sourceDir: string, destDir: string, publicPathPrefix: string }} rewrite
 */
async function mdastToHtml (nodes, rewrite) {
  if (!nodes || !nodes.length) return ''
  const md = mdastToMd(nodes)
  if (!md.trim()) return ''
  const vfile = new VFile({ value: md, data: { rewrite } })
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGitHubAlert)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeGlossaryLinks)
      .use(rehypeRewriteLocalImgs(rewrite))
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
    glossary: front.glossary && typeof front.glossary === 'object' ? front.glossary : {}
  }

  const sourceDir = path.dirname(abs)
  const publicPathPrefix = `manual-assets/${id}`.replace(/\\/g, '/')
  const destDir = path.join(projectRoot, 'public', 'manual-assets', id)
  const rewrite = { sourceDir, destDir, publicPathPrefix }
  const globalSlug = new GithubSlugger()
  const linkIndex = /** @type {Record<string, { part: number, tile: number, subsection?: number }>} */ ({})

  const proc = /** @type {import('unified').Processor} */ (unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkGitHubAlert))
  const root = /** @type {import('mdast').Root} */ (proc.parse(content))
  // strip HTML comments
  if (root.children) {
    root.children = root.children.filter(
      (n) =>
        !(
          n.type === 'html' &&
        /** @type {import('mdast').Html} */ (n).value &&
        (/** @type {import('mdast').Html} */ (n).value).trim().startsWith('<!--')
        )
    )
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
  const buildTile = async (trec, partIdx, tileIdx) => {
    const g = new GithubSlugger()
    const s = splitTileToSubsections(trec, g)
    if (s._body) {
      const html = await mdastToHtml(s._body, rewrite)
      linkIndex[s.id] = { part: partIdx, tile: tileIdx }
      return {
        id: s.id,
        title: s.title,
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
        const html = await mdastToHtml(sub.nodes, rewrite)
        linkIndex[sub.id] = { part: partIdx, tile: tileIdx, subsection: si }
        subsections.push({ id: sub.id, title: sub.title, html })
      }
      linkIndex[s.id] = { part: partIdx, tile: tileIdx }
      return {
        id: s.id,
        title: s.title,
        introHtml: intro,
        subsections,
        contentHtml: null
      }
    }
    return { id: s.id, title: s.title, subsections: null, contentHtml: '<p></p>' }
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
  const cfgPath = path.join(projectRoot, 'manuals.config.json')
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  if (!cfg.manuals?.length) {
    console.warn('No manuals in manuals.config.json')
    return
  }
  const outDir = path.join(projectRoot, 'src', 'data', 'manual-ir')
  fs.mkdirSync(outDir, { recursive: true })
  for (const m of cfg.manuals) {
    let ir
    try {
      ir = await buildOneManual(m)
    } catch (err) {
      throw enrichManualError(err, m)
    }
    const out = path.join(outDir, `${m.id}.json`)
    fs.writeFileSync(out, JSON.stringify(ir, null, 2), 'utf8')
    console.log(`Wrote ${path.relative(projectRoot, out)}`)
  }
}

main().catch((e) => {
  console.error(`[build-manuals] ${e.message}`)
  if (process.env.DEBUG && e.cause) console.error(e.cause)
  process.exit(1)
})
