import viteCompression from "vite-plugin-compression";

import { svelte } from "@sveltejs/vite-plugin-svelte";

import { createHtmlPlugin } from "vite-plugin-html";

import obfuscator from "javascript-obfuscator";

import { readFileSync } from "fs";

import { UserConfig } from "vite";



const obfuscationConfig = JSON.parse(readFileSync(new URL("./obfuscator.json", import.meta.url), "utf-8"));



export default {
	base: "./",

	server: {
		port: 80,
		//open: true,
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		}
	},

	preview: {
		port: 80,
	},

	build: {
		outDir: "../production/client",
		emptyOutDir: true,

		rollupOptions: {
			external: ["stats.js"],
			output: {
				format: "esm",

				manualChunks: (id): string | void => {
					if (id.includes("pixi-filters")) {
						return "pixi-filters";
					}

					else if (id.includes("pixi.js")) {
						return "pixi";
					}
				},

				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name === "pixi" || chunkInfo.name === "pixi-filters") {
						return "packages/[name]-[hash].js";
					}

					return "[name]-[hash].js";
				},

				chunkFileNames: (chunkInfo) => {
					if (chunkInfo.name === "pixi" || chunkInfo.name === "pixi-filters") {
						return "packages/[name]-[hash].js";
					}

					return "[name]-[hash].js";
				},
			},

			plugins: [
				{
					name: "obfuscate-entry",
					generateBundle(options, bundle) {
						for (const file of Object.values(bundle)) {
							if (file.type === "chunk" && file.isEntry) {
								const obfuscatedCode = obfuscator.obfuscate(file.code, obfuscationConfig).getObfuscatedCode();

								file.code = obfuscatedCode;
							}
						}
					}
				}
			]
		},
		minify: "esbuild",
		target: "esnext",
		cssMinify: "lightningcss",
	},

	optimizeDeps: {
		include: ["pixi.js", "pixi-filters"],
	},

	plugins: [
		svelte(),

		createHtmlPlugin({
			minify: true,
		}),

		viteCompression({
			algorithm: "brotliCompress",
			ext: ".br",
		}),

		viteCompression({
			algorithm: "gzip",
			ext: ".gz",
		}),
	],
} satisfies UserConfig;