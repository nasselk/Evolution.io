import { newContainer } from "../rendering/createVisuals";

import { BitmapText, type Container } from "pixi.js";



class GameUI {
	public readonly container: Container;
	private readonly isMobile: boolean;
	public readonly FPS: BitmapText;
	public readonly TPS: BitmapText;
	public readonly mspt: BitmapText;


	public constructor(isMobile: boolean) {
		this.isMobile = isMobile;
		
		this.container = newContainer({
			renderGroup: true,
			visible: true,
		});

		this.FPS = new BitmapText({
			tint: "cyan",
			roundPixels: true,
			anchor: {
				x: 1,
				y: 0.5,
			},
			style: {
				fontSize: 25,
			}
		});


		this.TPS = new BitmapText({
			tint: "cyan",
			roundPixels: true,
			anchor: {
				x: 1,
				y: 0.5,
			},
			style: {
				fontSize: 25,
			}
		});


		this.mspt = new BitmapText({
			tint: "cyan",
			roundPixels: true,
			anchor: {
				x: 1,
				y: 0.5,
			},
			style: {
				fontSize: 25,
			}
		});
	}


	public init(scale: number, canvas: HTMLCanvasElement): void {
		this.container.zIndex = 100;
		
		this.FPS.style.fontFamily = "Baloo 2";
		this.TPS.style.fontFamily = "Baloo 2";
		this.mspt.style.fontFamily = "Baloo 2";

		this.container.addChild(this.FPS, this.TPS, this.mspt);

		this.render(scale, canvas);
	}


	public render(scale: number, canvas: HTMLCanvasElement): void {
		this.container.scale.set(scale);
		
		this.FPS.position.set(canvas.width / scale - 25, 25);

		this.TPS.position.set(canvas.width / scale - 25, 65);

		this.mspt.position.set(canvas.width / scale - 25, 105);
	}
}



export { GameUI };