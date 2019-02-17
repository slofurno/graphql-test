module.exports = {
  entry: './src/client.js',
  output: {
        filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  node: { fs: 'empty', net: 'empty' },
};
