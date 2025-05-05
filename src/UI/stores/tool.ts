import { writable } from "svelte/store";
import { game } from "../../game";
import { Vector } from "../../utils/math/vector";
import { type Entity } from "../../rendering/entities/entity";



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


function selectEntity(entity: Entity | null): void {
	selectedEntity = entity;
}


// Camera gestures
let draggingCamera = false;

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("pointerdown", (event: PointerEvent) => {
	if (currentTool === Tools.Camera && event.button === 0) {
		draggingCamera = true;
	}
});

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("pointerup", (event: PointerEvent) => {
	if (event.button === 0) {
		draggingCamera = false;
	}
});

window.addEventListener("pointermove", (event: PointerEvent) => {
	if (draggingCamera && currentTool === Tools.Camera && event.buttons === 1) {
		const movement = new Vector(
			event.movementX / game.camera.zoom,
			event.movementY / game.camera.zoom
		);

		game.camera.target.position.subtract(movement);
	}

	else {
		draggingCamera = false;
	}
});

document.querySelector<HTMLCanvasElement>("#canvas")?.addEventListener("wheel", (event: WheelEvent) => {
	if (currentTool === Tools.Camera) {
		const delta = event.deltaY / 1000;

		if (game.camera.target.zoom - delta > 0.05) {
			game.camera.target.zoom -= delta;
		}
	}
});



export { currentTool, selectedEntity, selectEntity, activeTool, tools, Tools, type Tool };