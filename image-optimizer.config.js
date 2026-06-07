/**
 * Shared image optimization settings — mirrors defaults from
 * vite-plugin-image-optimizer (Sharp + SVGO, lossless-first).
 * Used by vue.config.js (Webpack production build).
 */
module.exports = {
  sharpEncodeOptions: {
    jpeg: { quality: 100 },
    jpg: { quality: 100 },
    png: { quality: 100 },
    tiff: { quality: 100 },
    webp: { lossless: true },
    avif: { lossless: true },
    gif: {}
  },
  svgo: {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupNumericValues: false,
            removeViewBox: false,
            cleanupIds: { minify: false, remove: false },
            convertPathData: false
          }
        }
      },
      'sortAttrs',
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }]
        }
      }
    ]
  }
}
