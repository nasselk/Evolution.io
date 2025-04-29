import { Timeout } from "../utils/timers/timeout";

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
	game.startSimulation();
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


// Prevent right-click and scrolling
document.addEventListener("contextmenu", function (event: MouseEvent): void {
	if ((event.target as HTMLElement).tagName != "INPUT") {
		event.preventDefault();
	}
});

window.addEventListener("wheel", function (event: WheelEvent): void {
	event.preventDefault();
}, { passive: false });




const settingsLabels = document.querySelectorAll<HTMLLabelElement>("#settings label");
settingsLabels.forEach(label => {
	const range = label.querySelector<HTMLInputElement>("input[type='range']");
	const number = label.querySelector<HTMLInputElement>("input[type='number']");
	
	const title = label.title as keyof typeof game.config.entities;

	if (range && number) {
		range.addEventListener("input", () => {
			number.value = range.value;

			game.config.entities[title] = parseInt(range.value);
		});

		number.addEventListener("input", () => {
			range.value = number.value;

			game.config.entities[title] = parseInt(range.value);
		});
	}
});



export { switchUI, showMessage, hideMessage };