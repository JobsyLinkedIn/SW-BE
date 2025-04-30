export default {
    transform: {
      '^.+\\.js$': 'babel-jest', // Use Babel to transform JavaScript files
    },
    moduleFileExtensions: ['js', 'json'], // Recognize .js and .json files
    testEnvironment: 'node', // Use Node.js environment for testing
  };