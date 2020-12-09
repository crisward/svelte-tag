// NODE_ENV=test - Needed by "@snowpack/web-test-runner-plugin"
process.env.NODE_ENV = 'test';
const {defaultReporter} = require('@web/test-runner');
const specReporter = require('./testconf/spec-reporter.js')

module.exports = {
  plugins: [require('./testconf/snowpack-plugin.js')()],
  reporters: [
    // use the default reporter only for reporting test progress
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    // use another reporter to report test results
    specReporter(),
  ],
};
