import { Sprite, Container, AnimatedSprite, Texture, Graphics } from "pixi.js";


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



function newAnimatedSprite(sprites: Texture[], speed = 0.5, settings: settings = {}): AnimatedSprite {
	const sprite = new AnimatedSprite(Array.isArray(sprites) && sprites.length > 0 ? sprites : [ Texture.EMPTY ]);

	sprite.anchor.set(0.5, 0.5);

	sprite.x = settings.x || 0;

	sprite.y = settings.y || 0;

	sprite.width = settings.width || 0;

	sprite.height = settings.height || 0;

	sprite.rotation = settings.angle || 0;

	sprite.zIndex = settings.layer || 0;

	sprite.alpha = settings.alpha || 1;

	sprite.visible = settings.visible || true;

	sprite.animationSpeed = speed;

	sprite.eventMode = "none";

	sprite.interactiveChildren = false;


	sprite.play();


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



export { newContainer, newSprite, newAnimatedSprite, newGraphics };