module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@test': './src/test',
          },
        },
      ],
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-runtime',
    ],
    env: {
      test: {
        plugins: ['@babel/plugin-transform-runtime']
      }
    }
  };
};