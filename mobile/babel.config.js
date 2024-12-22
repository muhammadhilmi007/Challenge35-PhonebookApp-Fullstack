module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.ios.js', '.android.js', '.js', '.json'],
            alias: {
              '@components': './src/components',
              '@screens': './src/screens',
              '@services': './src/services',
              '@hooks': './src/hooks',
            },
          },
        ],
        'react-native-reanimated/plugin',
      ],
    };
  };