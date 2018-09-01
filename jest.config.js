module.exports = {
  rootDir: './',
  testRegex: '(\\.|/)(test|spec)\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/dist/index.js',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov'],
  collectCoverageFrom: ['DefinitionEditor.ts', 'TypeDefsEditor.ts'],
  moduleFileExtensions: ['ts', 'js'],
}
