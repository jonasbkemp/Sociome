var debug = process.env.NODE_ENV !== "production";
var client = process.env.NODE_ENV === 'client';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.resolve(__dirname + '/'),
  devtool: debug ? "inline-sourcemap" : false,
  entry: path.join(__dirname, "./static/js/client.jsx"),
  resolveLoader: {
    modules : ['node_modules']
  },
  resolve: {
    extensions: ['.js', '.jsx']
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
        test: /\.css$/, 
        loader: ['style-loader', 'css-loader']
      },
      { 
        test: /\.png$/, 
        loader: "url-loader?mimetype=image/png" 
      }
    ]
  },
  output: {
    path: path.join(__dirname, '/static/'),
    filename: 'client.min.js',
    publicPath: '/',
  },
  plugins: debug ? 
    [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env' : client ? {'NODE_ENV' : JSON.stringify('production')} : {}
    })
    ] : [
    new webpack.DefinePlugin({
      'process.env' : {'NODE_ENV' : JSON.stringify('production')}
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
