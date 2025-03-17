import { toUint8Angle } from "../utils/math/angle";

import { MsgWriter } from "../utils/thread/writer";

import { Game } from "../game";



let lastMouseMove: number = 0;

const minEventDelay: number = 1000 / 60;



function setComputerControls(game: Game): void {
	const binds = game.settings.binds;

	// Keyboard events
	window.addEventListener("keydown", (event: KeyboardEvent): void => {
		// For game portals
		if ([ "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Space" ].includes(event.code) && ![ "INPUT", "TEXTAREA" ].includes(event.target!.tagName)) {
			event.preventDefault();
		}

		if (!event.repeat && game.player) {
			if (binds.up.includes(event.code)) {
				game.socket.emit("startMovingUp");
			}

			else if (binds.down.includes(event.code)) {
				game.socket.emit("startMovingDown");
			}

			else if (binds.left.includes(event.code)) {
				game.socket.emit("startMovingLeft");
			}

			else if (binds.right.includes(event.code)) {
				game.socket.emit("startMovingRight");
			}

			else if (event.code === "KeyC" && event.ctrlKey && !game.camera.attached) {
				event.preventDefault();

				game.camera.attached = true;

				game.camera.target.zoom = 1;

				if (game.camera.syncZoom) {
					const buffer = new MsgWriter(4);

					buffer.writeFloat32(game.camera.target.zoom);

					game.socket.emit("zoom", buffer.bytes);
				}
			}

			else if (event.code === "KeyX" && event.ctrlKey) {
				event.preventDefault();

				game.camera.syncZoom = !game.camera.syncZoom;


				const buffer = new MsgWriter(4);

				if (game.camera.syncZoom) {
					buffer.writeFloat32(game.camera.target.zoom);
				}

				else {
					buffer.writeFloat32(1);
				}

				game.socket.emit("zoom", buffer.bytes);
			}
		}
	});


	window.addEventListener("keyup", (event: KeyboardEvent): void => {
		if (game.player) {
			if (binds.up.includes(event.code)) {
				game.socket.emit("stopMovingUp");
			}

			else if (binds.down.includes(event.code)) {
				game.socket.emit("stopMovingDown");
			}

			else if (binds.left.includes(event.code)) {
				game.socket.emit("stopMovingLeft");
			}

			else if (binds.right.includes(event.code)) {
				game.socket.emit("stopMovingRight");
			}
		}
	});


	window.addEventListener("keypress", (event: KeyboardEvent): void => {
	});



	// Mouse events
	game.renderer.canvas.addEventListener("mousedown", (event: MouseEvent): void => {
		const keyboardEvent = new KeyboardEvent("keydown", {
			code: `Mouse${ event.button }`
		});

		window.dispatchEvent(keyboardEvent);
	});


	window.addEventListener("mouseup", (event: MouseEvent): void => {
		const keyboardEvent = new KeyboardEvent("keyup", {
			code: `Mouse${ event.button }`
		});

		window.dispatchEvent(keyboardEvent);
	});


	window.addEventListener("mousemove", (event: MouseEvent): void => {
		const now = performance.now();

		if (game.player && now - lastMouseMove > minEventDelay) {
			const cursor = {
				x: event.clientX * devicePixelRatio * game.renderer.resolution,
				y: event.clientY * devicePixelRatio * game.renderer.resolution,
			};


			const screen = {
				x: game.renderer.canvas.width / 2,
				y: game.renderer.canvas.height / 2,
			};


			const dX = cursor.x - screen.x;
			const dY = cursor.y - screen.y;


			const buffer = new MsgWriter(1);

			const angle = Math.atan2(dY, dX);

			buffer.writeUint8(toUint8Angle(angle));

			game.socket.emit("playerAngle", buffer.bytes);

			lastMouseMove = now;
		}
	});


	document.addEventListener("contextmenu", function (event: MouseEvent): void {
		if ((event.target as HTMLElement).tagName != "INPUT") {
			event.preventDefault();
		}
	});


	window.addEventListener("wheel", function (event: WheelEvent): void {
		event.preventDefault();
	}, { passive: false });
}



export { setComputerControls, minEventDelay };