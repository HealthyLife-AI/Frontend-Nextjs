import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Vendored React Bits components (src/components/reactbits/) are kept
    // byte-for-byte as the registry publishes them so they can be
    // re-synced with a diff. They write a settings ref during render,
    // which this project's own code must not do — linting them would only
    // force edits that make the next upstream sync harder.
    files: ["src/components/reactbits/**"],
    rules: { "react-hooks/refs": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
