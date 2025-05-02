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
	Default,
	Select,
	Move,
	Destroy,
	Camera
}


const tools: Tool[] = [
	{
		id: Tools.Default,
		label: "Inputs are transmitted to the game normally",
		icon: "../../../public/assets/cursors/pointer.png",
		cursor: "auto",
	},
	{
		id: Tools.Move,
		label: "Move an object in the scene",
		icon: "../../../public/assets/cursors/target.png",
		cursor: "move"
	},
	{
		id: Tools.Destroy,
		label: "Delete an object in the scene",
		icon: "../../../public/assets/cursors/delete.png",
		cursor: "crosshair"
	},
	{
		id: Tools.Camera,
		label: "Move the camera",
		icon: "../../../public/assets/cursors/move.png",
		cursor: "move"
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
window.addEventListener("mousemove", (event) => {
	if (currentTool === Tools.Camera && event.buttons === 1) {
		const movement = new Vector(
			event.movementX / game.camera.zoom,
			event.movementY / game.camera.zoom
		);

		game.camera.target.position.subtract(movement);
	}
});


window.addEventListener("wheel", (event) => {
	if (currentTool === Tools.Camera) {
		const delta = event.deltaY / 1000;

		if (game.camera.target.zoom - delta > 0.05) {
			game.camera.target.zoom -= delta;
		}
	}
});



export { currentTool, selectedEntity, selectEntity, activeTool, tools, Tools, type Tool };