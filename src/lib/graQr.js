import QRCode from 'qrcode'
import { displayTaskCode, displayTaskUrl, isUsableToken, playTaskUrl, verifyTaskUrl } from '@/lib/graUrls'
import { graIconName } from '@/lib/graIcons'

/**
 * Build a QR data-URL with a Material Icons glyph in the quiet center.
 * `qrcode` has no logo API — we draw on canvas after encode.
 * Uses errorCorrectionLevel H so scanners tolerate the covered modules.
 */
export async function qrDataUrlWithIcon (text, iconGlyph, options = {}) {
  const width = options.width || 360
  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, text, {
    width,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  })

  const glyph = (iconGlyph || 'help_outline').trim()
  if (glyph) {
    await ensureMaterialIconsFont()
    paintCenterIcon(canvas, glyph, options.iconColor || '#2e7d32')
  }

  return canvas.toDataURL('image/png')
}

async function ensureMaterialIconsFont () {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.load('48px "Material Icons"')
    await document.fonts.ready
  } catch {
    // fall through — fillText may still work if CSS already loaded the face
  }
}

function paintCenterIcon (canvas, glyph, color) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = canvas.width
  const pad = Math.round(size * 0.24)
  const x = (size - pad) / 2
  const y = (size - pad) / 2
  const radius = Math.max(4, Math.round(pad * 0.18))

  ctx.fillStyle = '#ffffff'
  roundRect(ctx, x, y, pad, pad, radius)
  ctx.fill()

  const fontSize = Math.round(pad * 0.62)
  ctx.fillStyle = color
  ctx.font = `${fontSize}px "Material Icons"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(glyph, size / 2, size / 2 + fontSize * 0.02)
}

function roundRect (ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function loadQrImage (src) {
  if (!src) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
    if (img.complete) resolve()
  })
}

/** Screen preview (plain) + A4 print (icon in center) QR bundle for one quest. */
export async function buildQuestQrBundle ({ acceptToken, verifyToken, icon }) {
  if (!isUsableToken(acceptToken) || !isUsableToken(verifyToken)) {
    throw new Error('Brak tokenów QR dla tego zadania (accept/verify).')
  }
  const playUrl = playTaskUrl(acceptToken)
  const verifyUrl = verifyTaskUrl(verifyToken)
  const plainOpts = { width: 360, margin: 1, errorCorrectionLevel: 'M' }
  const glyph = graIconName(icon)
  const [playSrc, verifySrc, playPrintSrc, verifyPrintSrc] = await Promise.all([
    QRCode.toDataURL(playUrl, plainOpts),
    QRCode.toDataURL(verifyUrl, plainOpts),
    qrDataUrlWithIcon(playUrl, glyph, { width: 360 }),
    qrDataUrlWithIcon(verifyUrl, glyph, { width: 360 })
  ])
  return {
    playUrl,
    verifyUrl,
    playUrlDisplay: displayTaskUrl(playUrl),
    verifyUrlDisplay: displayTaskUrl(verifyUrl),
    playCode: displayTaskCode(acceptToken),
    verifyCode: displayTaskCode(verifyToken),
    playSrc,
    verifySrc,
    playPrintSrc,
    verifyPrintSrc
  }
}
