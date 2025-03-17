//import { writeFOV } from "../networking/listeners";
import Simulation from "../simulation/index?worker&inline";

import { Timeout } from "../utils/timers/timeout";

import { Thread } from "../utils/thread/thread";

import { game } from "../game";



let displayedBox: string = "playButton";



function switchUI(appear: string, disappear: string | string[] = displayedBox, display: string = "flex", main: boolean = true): void {
	if (typeof disappear === "string") {
		disappear = [ disappear ];
	}

	else if (!disappear) {
		disappear = [];
	}


	for (const id of disappear) {
		if (id != appear) {
			const element = document.getElementById(id);

			element?.style.setProperty("display", "none");
		}
	}


	if (appear && appear != displayedBox) {
		const element = document.getElementById(appear);

		element?.style.setProperty("display", display);

		if (main) {
			displayedBox = appear;
		}
	}
}



let messageTimeout: Timeout | undefined;

const messageBox = document.querySelector<HTMLDivElement>("#serverMessage")!;

function showMessage(message: string, type: "info" | "warn" | "error" = "info", timeout?: number): void {
	messageBox.classList.remove("info", "warn", "error");

	messageBox.classList.add(type);

	messageBox.style.display = "block";

	messageBox.textContent = message;


	if (messageTimeout) {
		messageTimeout.clear();
	}

	if (timeout) {
		new Timeout(() => {
			messageBox.style.display = "none";
		}, timeout);
	}
}

function hideMessage(): void {
	messageBox.style.display = "none";
}



/* ************************************* MAIN MENU ************************************* */
document.querySelector("#playButton")?.addEventListener("click", function(): void {
	// Send the canvas size to the server
	//const buffer = writeFOV();

	//game.socket.emit("startGameSession", buffer.bytes);

	const thread = new Simulation();

	game.simulation = new Thread(thread);

	game.simulation.send("init", game.sharedBuffer.buffer);


	game.simulation.on("update", (count: number) => {
		game.update(count);
	});
});



document.querySelector("#canvas")?.addEventListener("click", function(): void {
	switchUI("playButton", displayedBox, "block");
});



document.querySelector("#fullscreen")?.addEventListener("click", function(): void {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	}

	else {
		document.documentElement.requestFullscreen();
	}
});



export { switchUI, showMessage, hideMessage };