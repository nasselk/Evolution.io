import { Assets, BitmapFont, Texture } from "pixi.js";



type textureFormats = "jpg" | "png" | "avif" | "webp" | "jxl" | "ktx2";


const textures: Map<string, Texture | Promise<Texture>> = new Map();


// Load assets needed at the start of the game (fonts, atlases/spritesheets, etc.)
async function loadAssets(): Promise<void[]> {
	const loadPromises: Promise<void>[] = [];


	Assets.addBundle("fonts", [
		{ alias: "Baloo2", src: "./assets/fonts/Baloo2.woff2" },
	]);


	const fontsPromise = Assets.loadBundle("fonts").then((): void => {
		BitmapFont.install({
			name: "Baloo 2",
			padding: 15,
			style: {
				fontSize: 40,
				fill: "white",
				fontFamily: "Baloo2",
				dropShadow: {
					color: "black",
					angle: Math.PI / 6,
					blur: 2,
					distance: 3,
				}
			}
		});
	});


	loadPromises.push(fontsPromise);


	return Promise.all(loadPromises);
}



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



export { textures, loadAssets, getTexture, getTextures };