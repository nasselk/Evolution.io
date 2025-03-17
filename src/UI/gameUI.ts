import { newContainer } from "../rendering/createVisuals";

import { BitmapText, type Container } from "pixi.js";



class GameUI {
	public readonly container: Container;
	public readonly latency: BitmapText;
	private readonly isMobile: boolean;
	public readonly FPS: BitmapText;

	public constructor(isMobile: boolean) {
		this.isMobile = isMobile;
		
		this.container = newContainer({
			renderGroup: true,
			visible: true,
		});


		this.latency = new BitmapText({
			tint: "cyan",
			roundPixels: true,
			style: {
				fontSize: 25,
			}
		});


		this.FPS = new BitmapText({
			tint: "cyan",
			roundPixels: true,
			style: {
				fontSize: 25,
			}
		});
	}


	public init(scale: number, canvas: HTMLCanvasElement): void {
		this.container.zIndex = 100;
		
		this.FPS.style.fontFamily = "Baloo 2";
		this.latency.style.fontFamily = "Baloo 2";

		this.container.addChild(this.FPS, this.latency);

		this.render(scale, canvas);
	}


	public render(scale: number, canvas: HTMLCanvasElement): void {
		this.container.scale.set(scale);
		
		this.FPS.position.set(canvas.width / scale - 100, 25);

		this.latency.position.set(canvas.width / scale - 100, 65);
	}
}



export { GameUI };