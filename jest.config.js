/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

require("dotenv").config({
    path: "./.env.local"
})

module.exports = {
    preset: "ts-jest",
    coverageProvider: "v8",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest"
    },
    setupFiles: ["dotenv/config"]
}
