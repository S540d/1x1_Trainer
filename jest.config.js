module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
      },
    }],
    '^.+\\.jsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^expo-linear-gradient$': '<rootDir>/__mocks__/expo-linear-gradient.js',
    '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
    '^expo-status-bar$': '<rootDir>/__mocks__/expo-status-bar.js',
    '^@expo-google-fonts/(.*)$': '<rootDir>/__mocks__/@expo-google-fonts.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-localization|expo-linear-gradient|expo-font|expo-status-bar|@expo-google-fonts)/)',
  ],
};
