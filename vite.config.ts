import viteCompression from "vite-plugin-compression";

import { svelte } from "@sveltejs/vite-plugin-svelte";

import { createHtmlPlugin } from "vite-plugin-html";

import { UserConfig } from "vite";



export default {
	base: "./",

	server: {
		port: 80,
		open: true,
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		}
	},

	preview: {
		port: 80,
	},

	build: {
		outDir: "./build",
		emptyOutDir: true,

		rollupOptions: {
			output: {
				format: "esm",

				manualChunks: (id): string | void => {
					if (id.includes("pixi.js")) {
						return "pixi";
					}
				},

				entryFileNames: (chunkInfo) => {
					if (chunkInfo.name === "pixi") {
						return "packages/[name]-[hash].js";
					}

					return "[name]-[hash].js";
				},

				chunkFileNames: (chunkInfo) => {
					if (chunkInfo.name === "pixi") {
						return "packages/[name]-[hash].js";
					}

					return "[name]-[hash].js";
				},
			}
		},
		minify: "esbuild",
		target: "esnext",
		cssMinify: "lightningcss",
	},

	optimizeDeps: {
		include: [ "pixi.js" ],
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