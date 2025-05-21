import { Sprite, Container, Texture, Graphics } from "pixi.js";


interface settings {
	x?: number;
	y?: number;
	angle?: number;
	visible?: boolean;
	anchor?: boolean;
	tint?: number | string;
	layer?: number;
	alpha?: number;
	width?: number;
	height?: number;
	roundPixels?: boolean;
	renderGroup?: boolean;
	label?: string;
}



// Each function creates a new visual object with the given and default settings 

function newContainer(settings: settings = {}): Container {
	const container = new Container({
		x: settings.x ?? 0,
		y: settings.y ?? 0,
		rotation: settings.angle ?? 0,
		zIndex: settings.layer ?? 0,
		isRenderGroup: settings.renderGroup ?? false,
		visible: settings.visible ?? true,
		label: settings.label ?? "",
		//interactiveChildren: false,
		cullableChildren: false,
		//interactive: false,
		eventMode: "static",
		cullable: false,
	});
    
	return container;
}



function newSprite(texture: Texture, settings: settings = {}): Sprite {
	const sprite = new Sprite({
		texture: texture || Texture.EMPTY,
		x: settings.x ?? 0,
		y: settings.y ?? 0,
		width: settings.width ?? 0,
		height: settings.height ?? 0,
		rotation: settings.angle ?? 0,
		zIndex: settings.layer ?? 0,
		alpha: settings.alpha ?? 1,
		label: settings.label ?? "",
		visible: settings.visible ?? true,
		tint: settings.tint ?? "white",
		roundPixels: settings.roundPixels ?? false,
		//interactive: false,
		cullable: false,
		//eventMode: "auto",
	});

    
	if (settings.anchor !== false) {
		sprite.anchor.set(0.5, 0.5);
	}

	return sprite;
}


function newGraphics(settings: settings = {}): Graphics {
	const graphics = new Graphics({
		x: settings.x ?? 0,
		y: settings.y ?? 0,
		width: settings.width ?? 0,
		height: settings.height ?? 0,
		rotation: settings.angle ?? 0,
		zIndex: settings.layer ?? 0,
		alpha: settings.alpha ?? 1,
		label: settings.label ?? "",
		visible: settings.visible ?? true,
		tint: settings.tint ?? "white",
		roundPixels: settings.roundPixels ?? false,
		interactiveChildren: false,
		cullableChildren: false,
		interactive: false,
		cullable: false,
		eventMode: "none",
	});


	return graphics;
}



export { newContainer, newSprite, newGraphics };