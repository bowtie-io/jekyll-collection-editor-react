var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: [
    './index'
  ],
  output: {
    path: path.join('../bowtie-lite/public/static'),
    filename: '../../app/assets/javascripts/collection-editor.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': { 'NODE_ENV': JSON.stringify('production') }
    }),
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
        })
  ],
  resolve: {
    alias: {
      root: path.join(__dirname, 'containers', 'Root.prod'),
      configureStore: path.join(__dirname, 'store', 'configureStore.prod')
    }
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel', 'strip-loader?strip[]=console.log'],
        exclude: /node_modules/,
        include: __dirname
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
         {
test: /\.(jpe?g|png|gif|svg)$/i,
       loaders: [
         'url?limit=2048&name=[name]-[sha1:hash:hex:10].[ext]', // Inline images if they're less than 2 KiB
       //'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
       ]
         },
         {
test: /\.(eot|svg|ttf|woff2?)(\?\w+)?$/i,
       loaders: [
         'file?name=[name]-[sha1:hash:hex:10].[ext]',
       ]
         },

    ]
  }
}
