import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["next-env.d.ts", ".next/*", "node_modules/*", "tests-examples/*"],
  },
  // Convert traditional "extends" using FlatCompat
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    // You can add more rules, overrides, etc. here
    rules: {
      // Ensure that unused imports are removed or flagged as errors
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { args: "after-used", argsIgnorePattern: "^_" },
      ],

      // If you want to explicitly set the Prettier error level (optional):
      // 'prettier/prettier': 'error',
    },
  },
];

export default eslintConfig;
