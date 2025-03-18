import { Assets, Texture } from "pixi.js";

/*import "pixi.js/basis";

import "pixi.js/ktx2";*/



type textureFormats = "jpg" | "png" | "avif" | "webp" | "jxl" | "ktx2";

const textures: Map<string, Texture | Promise<Texture>> = new Map();



async function getTexture(url: string, format?: textureFormats): Promise<Texture> {
	url = formatTextureURL(url, format);

	const texture = textures.get(url);

	if (texture instanceof Texture || texture instanceof Promise) {
		return texture;
	}

	else {
		const promise: Promise<Texture> = Assets.load(url);

		textures.set(url, promise);

		return promise;
	}
}



async function getTextures<T extends readonly string[]>(...urls: T): Promise<{ [K in keyof T]: Texture }> {
	return Promise.all(urls.map(url => getTexture(url))) as Promise<{ [K in keyof T]: Texture }>;
}



function formatTextureURL(url: string, format: textureFormats = "png"): string {
	if (!url.startsWith("./assets")) {
		url = "./assets/" + url;
	}

	if (!url.endsWith(format)) {
		url += "." + format;
	}

	return url;
}



export { getTexture, getTextures };