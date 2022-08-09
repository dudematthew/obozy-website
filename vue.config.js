const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  assetsDir: 'assets',
  transpileDependencies: true,
  lintOnSave: false,
  chainWebpack: config => {
    config
        .plugin('html')
        .tap(args => {
            args[0].title = "OBOZY - Gra Terenowa";
            return args;
        })
}
})
