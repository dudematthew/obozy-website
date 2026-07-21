import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
})

// Materialize: ul:not(.browser-default) { list-style: none }. Opt lists back in.
function withBrowserDefault (ruleName) {
  const original = md.renderer.rules[ruleName]
  md.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
    tokens[idx].attrJoin('class', 'browser-default')
    if (original) {
      return original(tokens, idx, options, env, self)
    }
    return self.renderToken(tokens, idx, options)
  }
}

withBrowserDefault('bullet_list_open')
withBrowserDefault('ordered_list_open')

// Materialize Materialbox: click-to-zoom (same as AboutUs / Quiz).
const defaultImageRender = md.renderer.rules.image
  || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  // Match working pages: materialboxed + responsive-img (not only materialboxed).
  token.attrJoin('class', 'materialboxed responsive-img')
  const alt = token.content || ''
  if (alt && !token.attrGet('data-caption')) {
    token.attrSet('data-caption', alt)
  }
  return defaultImageRender(tokens, idx, options, env, self)
}

/**
 * markdown-it wraps block images in <p>. Materialbox then inserts a <div>
 * placeholder around the <img>, which browsers hoist out of <p> and break clicks.
 * Working AboutUs/Quiz imgs are never inside <p>. Unwrap so structure matches.
 */
function unwrapMarkdownImages (html) {
  return String(html).replace(
    /<p>\s*(<img\b[^>]*>)\s*<\/p>/gi,
    '<div class="gra-md__figure">$1</div>'
  )
}

export function renderGraMarkdown (source) {
  if (!source) return ''
  const html = md.render(String(source))
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['class', 'data-caption']
  })
  return unwrapMarkdownImages(clean)
}
