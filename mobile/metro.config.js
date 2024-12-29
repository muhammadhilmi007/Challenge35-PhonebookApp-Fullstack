const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@types': path.resolve(__dirname, 'src/types'),
};

defaultConfig.watchFolders = [
  path.resolve(__dirname, 'src/components'),
  path.resolve(__dirname, 'src/screens'),
  path.resolve(__dirname, 'src/services'),
  path.resolve(__dirname, 'src/hooks'),
  path.resolve(__dirname, 'src/types'),
];

module.exports = defaultConfig;
