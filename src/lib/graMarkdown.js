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

export function renderGraMarkdown (source) {
  if (!source) return ''
  const html = md.render(String(source))
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}
