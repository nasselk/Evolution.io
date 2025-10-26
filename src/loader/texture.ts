import { Assets, Texture } from "pixi.js";

import { warn } from "../utils/logger";

type textureFormats = "jpg" | "png" | "avif" | "webp" | "jxl" | "ktx2";

const textures: Map<string, Texture | Promise<Texture>> = new Map();

async function getTexture(url: string, format?: textureFormats, fallbacks: string | string[] = []): Promise<Texture> {
	url = formatTextureURL(url, format);

	const texture = textures.get(url);

	if (texture instanceof Texture || texture instanceof Promise) {
		return texture;
	} else {
		const promise: Promise<Texture> = Assets.load(url).catch(() => {
			if (typeof fallbacks === "string") {
				fallbacks = [fallbacks];
			}

			if (fallbacks.length > 0) {
				warn("RENDERER", `Texture ${url} not found`);

				const fallback = fallbacks.shift()!;

				return getTexture(fallback, format, fallbacks);
			} else {
				throw new Error(`Texture ${url} not found`);
			}
		});

		textures.set(url, promise);

		return promise;
	}
}

async function getTextures<T extends readonly string[]>(...urls: T): Promise<{ [K in keyof T]: Texture }> {
	return Promise.all(urls.map((url) => getTexture(url))) as Promise<{ [K in keyof T]: Texture }>;
}

function formatTextureURL(url: string, format: textureFormats = "webp"): string {
	if (!url.startsWith("./assets")) {
		url = "./assets/" + url;
	}

	if (!url.endsWith(format)) {
		url += "." + format;
	}

	return url;
}

export { getTexture, getTextures };
