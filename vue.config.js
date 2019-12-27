const path = require('path')
const webpack = require('webpack')
// const fs = require('fs')
// const HtmlWebpackPlugin = require('html-webpack-plugin')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    // console.log('config')
    // fs.writeFileSync('./test.js', config)
    // config.resolve.alias
    //   .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
    //   .set('@c', resolve('src/components'))
    //   .set('@assets', resolve('src/assets'))
    //   .set('@api', resolve('src/api'))
    //   .set('@libs', resolve('src/libs'))
    //   .set('@views', resolve('src/views'))
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        '@c': resolve('src/components'),
        '@assets': resolve('src/assets'),
        '@api': resolve('src/api'),
        '@libs': resolve('src/libs'),
        '@views': resolve('src/views')
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        // $: 'jquery',
        // jQuery: 'jquery',
        // 'window.jQuery': 'jquery',
        // 'window.$': 'jquery',
        // Potree: 'Potree'
      })
    ]
  },
  // // 设为false打包时不生成.map文件
  productionSourceMap: false,
  // // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
  devServer: {
    proxy: 'http://test3d.smartcomma.com',
    port: 8099
  }
}
