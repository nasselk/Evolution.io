import { Assets, BitmapFont } from "pixi.js";

async function loadAssets(): Promise<void[]> {
	const loadPromises: Promise<void>[] = [];

	Assets.addBundle("fonts", [{ alias: "Baloo2", src: "./assets/fonts/Baloo2.woff2" }]);

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
				},
			},
		});
	});

	loadPromises.push(fontsPromise);

	return Promise.all(loadPromises);
}

export { loadAssets };
