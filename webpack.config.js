var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.resolve(__dirname + '/'),
  devtool: debug ? "inline-sourcemap" : null,
  entry: "./static/js/client.js",
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      webworkify: 'webworkify-webpack',
      'mapbox-gl': path.resolve(__dirname + '/node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'],
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, '/node_modules/webworkify/index.js'),
        loader: 'worker'
      },
      {
        test: /mapbox-gl.+\.js$/,
        include: path.resolve(__dirname + '/node_modules/mapbox-gl-shaders/index.js'),
        loader: 'transform/cacheable?brfs'
      },
      { test: /\.css$/, loader: 'style!css' },
    ],
    postLoaders: [{
      include: /node_modules\/mapbox-gl-shaders/,
      loader: 'transform',
      query: 'brfs'
    }]    
  },
  output: {
    path: __dirname + '/static/',
    filename: 'client.min.js',
    publicPath: '/',
  },
  plugins: debug ? 
    [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
    ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
