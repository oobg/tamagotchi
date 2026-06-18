import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const config = [
    {
        ignores: [
            ".next/**",
            "dist/**",
            "node_modules/**",
            "next-env.d.ts",
            "public/**",
            "log.js",
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    prettierConfig,
];

export default config;
