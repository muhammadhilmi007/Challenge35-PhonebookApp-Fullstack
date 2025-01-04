module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@testing-library/.*)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
    '^@/hooks/useThemeColor$': '<rootDir>/src/hooks/useThemeColor.ts',
    '^react-native/Libraries/Animated/NativeAnimatedHelper$': '<rootDir>/src/test/mocks/NativeAnimatedHelper.ts',
    '^@expo/vector-icons$': '<rootDir>/src/test/mocks/expo-vector-icons.ts',
    '^@expo/vector-icons/(.*)$': '<rootDir>/src/test/mocks/expo-vector-icons.ts',
    '^expo-blur$': '<rootDir>/src/test/mocks/expo-blur.ts',
    '^@fortawesome/react-native-fontawesome$': '<rootDir>/src/test/mocks/react-native-fontawesome.ts',
    '^react-native/Libraries/Settings/NativeSettingsManager$': '<rootDir>/src/test/mocks/NativeSettingsManager.ts'
  },
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
