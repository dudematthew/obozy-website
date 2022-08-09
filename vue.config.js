const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  assetsDir: 'assets',
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "url": false,
        "querystring": false
      } 
    }
  },
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "OBOZY - Gra Terenowa";
            return args;
        })
}
})