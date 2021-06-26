const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

const prod = process.env.NODE_ENV === 'production';

module.exports = {
   // 모드에 따라 웹팩에서 내장 최적화 제공
   mode: prod ? 'production' : 'development',

   // 소스 맵 생성 여부 및 방법 설정
   devtool: prod ? 'hidden-soure-map' : 'eval',

   // 번들링을 시작할 파일
   entry: {
      index: './src/index.js',
   },

   // 다양한 모듈들(js, image, css 등)을 처리하는 방법 결정
   module: {
      rules: [
         {
            // 처리할 모듈 형식 결정
            test: /.js$/,
            // 이 모듈에 사용할 loader
            use: 'babel-loader',
            // 제외할 파일들
            exclude: /node_modules/,
         },
         {
            test: /\.(sc|c)ss$/,
            use : [
               {
                  loader : MiniCssExtractPlugin.loader,
                  options: {
                     publicPath: '/dist/static/style/',
                  },
               },
               'css-loader',
               'sass-loader',
            ],
         },
         {
            test: /\.(png|jpg|svg)$/,
            use : [
               {
                  loader : 'file-loader',
                  options: {
                     outputPath: 'static/images',
                  },
               },
            ],
         },
      ],
   },

   // 빠르게 개발할 수 있도록 개발서버 제공
   devServer: {
      historyApiFallback: true,
      inline            : true,
      port              : 3000,
      hot               : true,
      publicPath        : '/',
   },

   // 번들링 된 파일이 생성될 위치 설정
   output: {
      path    : path.resolve(__dirname, 'dist'),
      filename: 'static/js/bundle.js',
   },

   // 적용할 플러그인 목록
   plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({ template: `./public/index.html` }),
      new webpack.HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({ filename: 'static/style/main.css' }),
   ],
};