var path = require('path')
var fs = require('fs')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    app: './src/main.js'
  },
  node: {
    fs: "empty"
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    },
    symlinks: false
  },
  // externals: {
  //   "moment": 'moment',
  //   "echarts": 'echarts',
  //   // "xml2js": 'xml2js'
  // },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // include: [
        //   path.resolve(__dirname, "src"),
        //   path.resolve(__dirname, "node_modules/ed25519-hd-key")
        // ]
       // exclude: /node_modules\/(?!(ed25519-hd-key)\/).*/
        exclude: /node_modules/,
        //include: [ path.resolve(__dirname, "node_modules", "ed25519-hd-key")],
        //exclude: [ path.resolve(__dirname, "node_modules")],
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'base64-font-loader'
      } ,{
        test: /\.node$/,
        use: 'node-loader'
      }
    ],
    loaders: [
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'stylus-loader', { loader: 'css-loader', options: { minimize: true } }]
      }
    ]
  }
}
