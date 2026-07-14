import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".netlify/**",
    ".turbo/**",
    ".vercel/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Intentionally left unchanged at the merchant's request.
    "src/app/api/upload-products/route.ts",
  ]),
]);

export default eslintConfig;
