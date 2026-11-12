import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // New in eslint-plugin-react-hooks shipped with Next.js 16.
      // Existing pages load data by calling setState from effects.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
