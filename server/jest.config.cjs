module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'jest-environment-node',
  testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.(mjs?|jsx?|js?|tsx?|ts?)$",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.mjs$": "babel-jest",
  },
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["js", "jsx", "mjs"],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  collectCoverage: false,
}