/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "no-console": "warn"
  },
  overrides: [
    {
      files: ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
      parserOptions: {
        project: [
          "./packages/shared/tsconfig.eslint.json",
          "./packages/config/tsconfig.eslint.json",
          "./packages/engine/tsconfig.eslint.json",
          "./packages/reporter/tsconfig.eslint.json",
          "./apps/cli/tsconfig.eslint.json"
        ],
        tsconfigRootDir: __dirname
      },
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error"
      }
    },
    {
      files: ["**/*.test.ts"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/explicit-function-return-type": "off"
      }
    }
  ],
  ignorePatterns: ["dist/", "node_modules/", "*.js", "*.cjs", "*.mjs", "vitest.config.ts"]
}