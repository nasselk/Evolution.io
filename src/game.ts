//import { connectToBestServer, type Servers } from "./networking/findServer";

import { setComputerControls } from "./controls/keyboard";

import { setMobileControls } from "./controls/mobile";

import { RenderingLoop } from "./rendering/renderer";

import { Interval } from "./utils/timers/interval";

import { getRandomInt } from "./utils/math/point";

import { Thread } from "./utils/thread/thread";

import * as classes from "./entities/manager";

//import { Socket } from "./networking/socket";

import { credit, log } from "./utils/logger";

import { Camera } from "./rendering/camera";

import { Entity } from "./entities/entity";

import settings from "./settings.json";

import { loadAssets } from "./loader";

import { GameUI } from "./UI/gameUI";

import { isMobile } from "pixi.js";

import config from "./config.json";

import { GameMap } from "./map";
import { SharedBuffer } from "./utils/thread/sharedBuffer";
import updates from "./utils/thread/updates";
import { getTypeDecoder, getUpdateDecoder } from "./utils/thread/connector";




class Game {
	public readonly camera: Camera;
	public readonly socket: Socket;
	public readonly config: typeof config;
	public readonly classes: typeof classes;
	public readonly settings: typeof settings;
	public readonly entities: typeof Entity.list;
	public readonly renderer: RenderingLoop;
	public player?: classes.player | null;
	public sharedBuffer: SharedBuffer;
	public readonly isMobile: boolean;
	public playerID?: number | null;
	public readonly map: GameMap;
	public readonly UI: GameUI;
	public simulation?: Thread;
	public pingEmit?: number;
	public shopContent?: any;


	public constructor() {
		this.classes = classes;
		this.isMobile = isMobile.any;
		this.UI = new GameUI(this.isMobile);
		//this.socket = new Socket("TCP");
		this.camera = new Camera(config.ENV === "development", this.socket, settings.interpolation);
		this.renderer = new RenderingLoop(this, this.UI.container);
		this.sharedBuffer = new SharedBuffer(10 * 1024 * 1024); // 10MB allocation
		this.map = new GameMap(this.renderer.worldContainer);
		this.entities = Entity.list;
		this.settings = settings;
		this.config = config;

		
		this.init();


		new Interval(() => {
			this.UI.FPS.text = `${ Math.round(this.renderer.frames) } FPS`;

			this.renderer.frames = 0;
		}, 1000);
	}


	public async init(): Promise<void> {
		credit("CLIENT");

		log("CLIENT", "Successfully initiated the game");


		// Load necessary content (elements in loads need to be loaded before connecting to the server)
		const loads = [
			loadAssets()
		];


		// Retrieve settings saved in localStorage
		this.retrieveSettings();

		// Set controls based on the device
		if (this.isMobile) {
			setMobileControls(this);
		}

		else {
			setComputerControls(this);
		}


		// Initialize the renderer
		this.renderer.init(this.settings.rendering);


		// Initialize the HUD
		this.UI.init(this.renderer.scale, this.renderer.canvas);


		// Set the camera position to a random point on the map
		this.camera.setPosition(
			getRandomInt(this.map.bounds.min.x, this.map.bounds.max.x),
			getRandomInt(this.map.bounds.min.y, this.map.bounds.max.y),
			true
		);


		await Promise.all(loads);
	}


	public update(count: number): void {
		const buffer = this.sharedBuffer.unlinkReader();


		let event: typeof updates[number];


		for (let i = 0; i < count; i++) {
			if (getUpdateDecoder(buffer.readUint16(false)) != undefined) { // If the next data is an update marker
				event = getUpdateDecoder(buffer.readUint16());
			}


			switch (event!) {
				case "createEntity": {
					const rawType = buffer.readUint16();

					const type = getTypeDecoder(rawType);

					Entity.create(type, buffer);

					break;
				}
					
				case "destroyEntity": {
					const id = buffer.readUint16();

					Entity.get(id)?.destroy();

					break;
				}


				case "position": {
					const id = buffer.readUint16();

					Entity.get(id)?.update(buffer);

					break;
				}
			}


			// Flags aren't merged between different updates within the world update
			buffer.lastFlagIndex = 0;
		}
	}


	// Apply settings saved in localStorage
	private retrieveSettings(): void {

	}
}



async function fetchJSON(url: string): Promise<any> {
	try {
		const response = await fetch(url, {
			headers: {
				accept: "application/json"
			}
		});

		return await response.json();
	}

	catch (error) {
		console.log(error);

		return null;
	}
}


const game = new Game();



export { Game, game };