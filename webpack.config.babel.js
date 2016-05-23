import path from 'path';
import fs from 'fs';
import webpack from 'webpack';

const SOURCE = path.resolve(__dirname, 'src');
const OUTPUT = path.resolve(__dirname);

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const config = {
  entry: [
    `${SOURCE}/index.js`
  ],
  output: {
    path: OUTPUT,
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /\.js$|\.jsx$/,
        loader: 'babel',
        include: [SOURCE],
        exclude: /(node_modules)/,
        // Presets here to over-ride babelrc
        query: {
          "presets": ["node6"]
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  externals: nodeModules,
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"Production"'
    })
  ]
};

export default config;
