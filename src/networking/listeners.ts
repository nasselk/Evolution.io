import { hideMessage } from "../UI/interaction";

import { decodeWorldState } from "./decoders";

import { Entity } from "../entities/entity";

import { type MsgReader } from "./reader";

import { type Socket } from "./socket";

import { MsgWriter } from "./writer";

import { game } from "../game";



function onConnect(socket: Socket): void {
	// Hide the error box (if it's visible)
	hideMessage();


	// Destroy all entities
	for (const entity of game.entities.values()) {
		entity.destroy();
	}


	// Retrieve session if possible
	if (localStorage.getItem("sessionID")) {
		const sessionID = localStorage.getItem("sessionID")!;

		const buffer = new MsgWriter(4 + sessionID.length);

		writeFOV(buffer);

		buffer.writeText(sessionID);


		socket.emit("retrieveSession", buffer.bytes);
	}


	// Add socket listeners
	addSocketListeners(socket);
};



// Set socket messages listeners each time connecting to a server
function addSocketListeners(socket: Socket): void {
	socket.on("pong", function(): void {
		game.UI.latency.text = `${ Math.round(performance.now() - game.pingEmit!) } ms`;
	});


	socket.on("init", function(data: MsgReader): void {
		const gameVersion = data.readText();

		if (gameVersion != game.config.gameVersion) {
			alert(`Game version mismatch: server@${ gameVersion }, client@${ game.config.gameVersion }`);
		}
	});
	

	socket.on("sessionID", function(data: MsgReader): void {
		const sessionID: string = data.readText();

		localStorage.setItem("sessionID", sessionID);
	});


	socket.on("playerID", function(data: MsgReader): void {
		game.playerID = data.readUint16();


		const player = Entity.get<"player">(game.playerID);

		if (player) {
			game.camera.target.entity = player;

			game.player = player;
		}

		document.getElementById("menu")!.style.display = "none";

		document.getElementById("gameUI")!.style.display = "block";
	});


	socket.on("stopGameSession", function(): void {
		game.camera.target.entity = null;

		game.playerID = null;

		game.player = null;

		document.getElementById("menu")!.style.display = "block";

		document.getElementById("gameUI")!.style.display = "none";
	});


	socket.on("update", function(data: MsgReader): void {
		decodeWorldState(data);
	});
}



function writeFOV(buffer = new MsgWriter(4)): MsgWriter {
	buffer.writeUint16(game.renderer.canvas.width);

	buffer.writeUint16(game.renderer.canvas.height);

	return buffer;
}



export { onConnect, writeFOV };