module.exports = {
  parserOpts: { strictMode: true },
  sourceMaps: 'inline',
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'auto',
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    'babel-plugin-transform-import-meta'
  ]
};
