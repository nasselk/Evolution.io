import { Graphics } from "pixi.js";



class CircleBox {
	public readonly graphics: Graphics;
	private x: number;
	private y: number;
	private radius: number;
	private color: string;
	private border?: { color: string, size: number };

	
	public constructor(settings: any) {
		this.graphics = new Graphics();

		this.x = settings.x;
		this.y = settings.y;
		this.radius = settings.radius;
		this.color = settings.color;
		this.border = settings.border;

		this.draw();
	}


	public resize(x: number, y: number, radius: number): void {
		this.x = x;
		this.y = y;
		this.radius = radius;

		this.draw();
	}


	public setColor(color: string): void {
		this.color = color;

		this.draw();
	}


	public setBorder(border: { color: string, size: number }): void {
		this.border = border;

		this.draw();
	}


	public draw(): void {
		this.graphics.clear();

		this.graphics.circle(this.x, this.y, this.radius);

		this.graphics.fill({ color: this.color });

		if (this.border) {
			this.graphics.stroke({ color: this.border.color, width: this.border.size });
		}
	}
}



class RectangleBox {
	public readonly graphics: Graphics;
	private x: number;
	private y: number;
	private width: number;
	private height: number;
	private color: string;
	private radius?: number;
	private border?: { color: string, size: number };

	
	public constructor(settings: any) {
		this.graphics = new Graphics();

		this.x = settings.x;
		this.y = settings.y;
		this.radius = settings.radius;
		this.width = settings.width;
		this.height = settings.height;
		this.color = settings.color;
		this.border = settings.border;

		this.draw();
	}

	
	public resize(x: number, y: number, width: number, height: number, radius?: number): void {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		if (radius) {
			this.radius = radius;
		}

		this.draw();
	}


	public setColor(color: string): void {
		this.color = color;

		this.draw();
	}


	public setBorder(border: { color: string, size: number }): void {
		this.border = border;

		this.draw();
	}


	public draw(): void {
		this.graphics.clear();


		if (this.radius) {
			this.graphics.roundRect(this.x, this.y, this.width, this.height, this.radius);
		}
		
		else {
			this.graphics.rect(this.x, this.y, this.width, this.height);
		}


		this.graphics.fill({ color: this.color });

		if (this.border) {
			this.graphics.stroke({ color: this.border.color, width: this.border.size });
		}
	}
}



export { CircleBox, RectangleBox };