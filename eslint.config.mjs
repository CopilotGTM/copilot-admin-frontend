import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

const reactCompilerRules = [
  "config",
  "error-boundaries",
  "gating",
  "globals",
  "immutability",
  "incompatible-library",
  "preserve-manual-memoization",
  "purity",
  "refs",
  "set-state-in-effect",
  "set-state-in-render",
  "static-components",
  "unsupported-syntax",
  "use-memo",
];

const eslintConfig = [
  {
    ignores: [
      "next-env.d.ts",
      ".next/*",
      "coverage/**",
      "node_modules/*",
      "tests-examples/*",
      "playwright-report/*",
      "test-results/*",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { args: "after-used", argsIgnorePattern: "^_" },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      ...Object.fromEntries(
        reactCompilerRules.map((rule) => [`react-hooks/${rule}`, "off"]),
      ),
    },
  },
];

export default eslintConfig;