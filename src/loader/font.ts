import { Assets, BitmapFont, type BitmapFontInstallOptions, Texture } from "pixi.js";

import { warn } from "../utils/logger";



type fontFormats = "woff2" | "ttf" | "otf";



async function loadBitmapFont(url: string, settings: BitmapFontInstallOptions, format?: fontFormats, fallbacks: string | string[] = []): Promise<Texture> {
	url = formatFontURL(url, format);

	const promise: Promise<Texture> = Assets.load(url).catch(() => {
		if (typeof fallbacks === "string") {
			fallbacks = [ fallbacks ];
		}

		if (fallbacks.length > 0) {
			warn("RENDERER", `Texture ${ url } not found`);

			const fallback = fallbacks.shift()!;

			return loadBitmapFont(fallback, settings, format, fallbacks);
		}

		else {
			throw new Error(`Texture ${ url } not found`);
		}
	});

	promise.then((): void => {
		BitmapFont.install(settings);
	});

	return promise;
}



function formatFontURL(url: string, format: fontFormats = "woff2"): string {
	if (!url.startsWith("./assets")) {
		url = "./assets/fonts/" + url;
	}

	if (!url.endsWith(format)) {
		url += "." + format;
	}

	return url;
}



export { loadBitmapFont };