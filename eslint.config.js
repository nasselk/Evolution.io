import TS from "@typescript-eslint/eslint-plugin";

import PARSER from "@typescript-eslint/parser";

import globals from "globals";

import JS from "@eslint/js";



export default [
	{
		ignores: [ "**/node_modules", "**/dist/", "**/packages/" ]
	},
	{
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		files: ["**/*.js", "**/*.ts"],
		rules: {
			...JS.configs.recommended.rules,
			semi: "error",
			"prefer-const": "error",
			quotes: ["error", "double"],
			indent: ["error", "tab", { "SwitchCase": 1 }],
			"no-undef": "error",
			"no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
					ignoreRestSiblings: true,
					caughtErrors: "none",
				},
			],
		},
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: PARSER,
		},
		plugins: {
			"@typescript-eslint": TS,
		},
		rules: {
			...TS.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "off",
			"no-dupe-class-members": "off"
		},
	},
];