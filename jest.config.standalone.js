/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const ENABLE_COVERAGE = !!process.env.CI;

// This config does not start up the standalone parser by default
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  displayName: "test",
  setupFiles: ["<rootDir>/tests_config/run-spec.ts"],
  snapshotSerializers: ["<rootDir>/tests_config/raw-serializer.ts"],
  testPathIgnorePatterns: [],
  collectCoverage: ENABLE_COVERAGE,
  collectCoverageFrom: [
    "src/**/*.ts",
    "dist/**/*.js",
    "!<rootDir>/node_modules/",
    "!src/http-client.ts",
    "!src/http-server.ts",
  ],
  transform: {},
};
