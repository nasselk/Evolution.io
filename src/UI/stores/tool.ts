import { Vector } from "../../utils/math/vector";

import { type Entity } from "../../rendering/entities/entity";

import { writable } from "svelte/store";

import Game from "../../game";



let currentTool: Tools | null = null;
let selectedEntity: Entity | null = null;


interface Tool {
	readonly id: Tools;
	readonly label: string;
	readonly icon: string;
	readonly cursor: string;
}


const enum Tools {
	Camera,
	Move,
	Destroy,
}


const tools: Tool[] = [
	{
		id: Tools.Camera,
		label: "Move the camera",
		icon: "/assets/engine/tools/move.png",
		cursor: "move"
	},
	{
		id: Tools.Move,
		label: "Move an object in the scene",
		icon: "/assets/engine/tools/target.png",
		cursor: "move"
	},
	{
		id: Tools.Destroy,
		label: "Delete an object in the scene",
		icon: "/assets/engine/tools/delete.png",
		cursor: "crosshair"
	},
];



const activeTool = writable<Tool | null>(null);

activeTool.subscribe((tool) => {
	currentTool = tool?.id ?? null;
});




let draggingCamera = false;
let rotatingCamera = false;

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("pointerdown", (event: PointerEvent) => {
	if (currentTool === Tools.Camera) {
		switch (event.button) {
			case 0:
				draggingCamera = true;

				break;

			case 2:
				rotatingCamera = true;

				break;
		}
	}
});

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("pointerup", (event: PointerEvent) => {
	switch (event.button) {
		case 0:
			draggingCamera = false;

			break;

		case 2:
			rotatingCamera = false;

			break;
	}
});

window.addEventListener("pointermove", (event: PointerEvent) => {
	if (currentTool === Tools.Camera && event.buttons > 0) {
		if (draggingCamera) {
			const delta = new Vector(event.movementX, event.movementY)
				.scale(Game.renderer.resolution / Game.camera.zoom)
				.rotate(-Game.camera.angle);

			Game.camera.target.position.subtract(delta);
		}

		else if (rotatingCamera) {
			const rotationSensitivity = 0.05;

			Game.camera.rotate(Game.camera.angle + event.movementY * rotationSensitivity);
		}
	}

	else {
		draggingCamera = false;
		rotatingCamera = false;
	}
});

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("wheel", (event: WheelEvent) => {
	if (currentTool === Tools.Camera) {
		const delta = event.deltaY / 1000;

		if (Game.camera.target.zoom - delta > 0.05) {
			Game.camera.target.zoom -= delta;
		}
	}
});


function selectEntity(entity: Entity | null): void {
	selectedEntity = entity;
}



export { currentTool, selectedEntity, selectEntity, activeTool, tools, Tools, type Tool };