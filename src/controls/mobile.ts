import { normalizeAngle, toUint8Angle } from "../utils/math/angle";

import { MsgWriter } from "../utils/thread/writer";

import { minEventDelay } from "./keyboard";

import { type Game } from "../game";

import { Rectangle } from "pixi.js";




class Joystick {
	static readonly activeTouches: { [key: number]: Joystick } = {};

	private readonly base: HTMLDivElement;
	private readonly stick: HTMLDivElement;
	private readonly dragOffset: { x: number, y: number };
	public readonly activeBounds?: Rectangle;
	public moveCallback?: (angle: number, distance?: number) => void;
	public touchCallback?: () => void;
	public endCallback?: (angle?: number, distance?: number) => void;
	private touchID: number | null;
	private sticky: boolean;
	private lastDrag: number;
	

	public constructor(sticky: boolean = false, activeBounds?: Rectangle) {
		this.touchID = null;
		this.lastDrag = 0;
		this.dragOffset = { x: 0, y: 0 };
		this.activeBounds = activeBounds;
		this.sticky = sticky;


		this.base = document.createElement("div");
		this.base.classList.add("joystick");


		this.stick = document.createElement("div");
		this.base.appendChild(this.stick);


		document.querySelector("#gameUI")?.appendChild(this.base);


		this.base.addEventListener("touchstart", this.touchstart.bind(this), { passive: true });

		document.getElementById("canvas")?.addEventListener("touchstart", this.globalTouchStart.bind(this), { passive: true });
	}


	private globalTouchStart(event: TouchEvent): void {
		const touch = event.changedTouches[0];

		if (this.activeBounds && touch.clientX >= this.activeBounds.x && touch.clientX <= this.activeBounds.x + this.activeBounds.width && touch.clientY >= this.activeBounds.y && touch.clientY <= this.activeBounds.y + this.activeBounds.height) {
			this.touchstart(event);
		}
	}


	private touchstart(event: TouchEvent): void {
		if (!this.touchID) {
			this.touchID = event.changedTouches[0].identifier;

			Joystick.activeTouches[this.touchID] = this;


			if (this.sticky) {
				this.base.style.left = `${ event.changedTouches[0].clientX - this.base.offsetWidth / 2 }px`;
				this.base.style.top = `${ event.changedTouches[0].clientY - this.base.offsetHeight / 2 }px`;
			}

		
			this.dragOffset.x = this.base.offsetLeft + this.base.offsetWidth / 2 - event.changedTouches[0].clientX;
			this.dragOffset.y = this.base.offsetTop + this.base.offsetHeight / 2 - event.changedTouches[0].clientY;

			this.base.style.opacity = "1";

			if (this.touchCallback) {
				this.touchCallback();
			}
		}		
	}


	public touchmove(touch: Touch): void {
		const now = performance.now(); 

		if (now - this.lastDrag >= minEventDelay) {
			this.stick.style.transition = "0s";

			const base = this.base.getBoundingClientRect();
			const stick = this.stick.getBoundingClientRect();


			const dx = base.x + base.width / 2 - touch.clientX - this.dragOffset.x;
			const dy = base.y + base.height / 2 - touch.clientY - this.dragOffset.y;


			const angle = Math.atan2(dy, dx);


			const distance = Math.min(Math.sqrt(dx * dx + dy * dy), base.width / 2);
			
			this.lastDrag = now;

			if (distance < base.width / 6) {
				return this.touchend(false, angle);
			}


			const x = -Math.cos(angle) * distance;
			const y = -Math.sin(angle) * distance;


			this.stick.style.transform = `translate3d(${ x - stick.width / 2 }px, ${ y - stick.height / 2 }px, 0px)`;


			if (this.moveCallback) {
				this.moveCallback(normalizeAngle(angle), distance);
			}
		}
	}


	public touchend(end: boolean = true, angle?: number): void {
		this.stick.style.transition = "0.15s";

		this.stick.style.transform = "translate3d(-50%, -50%, 0px)";

		if (end) {
			if (this.sticky) {
				this.base.style.opacity = "0";
			}

			this.touchID = null;
		}

		this.endCallback?.(angle);
	}
}



function setMobileControls(game: Game): void {
	document.addEventListener("touchmove", function(event): void {
		for (const touch of event.changedTouches) {
			const joystick = Joystick.activeTouches[touch.identifier];

			joystick?.touchmove(touch);
		}
	}, { passive: true });



	document.addEventListener("touchend", function(event): void {
		for (const touch of event.changedTouches) {
			const joystick = Joystick.activeTouches[touch.identifier];

			joystick?.touchend();

			delete Joystick.activeTouches[touch.identifier];
		}
	}, { passive: true });

	

	// Disable pinch-to-zoom
	document.addEventListener("touchmove", function (event: TouchEvent): void {
		if (event.touches.length > 1) {
			event.preventDefault();
		}
	}, { passive: false });



	// Disable double-tap zoom
	let lastTouchEnd = 0;

	document.addEventListener("touchstart", function (event: TouchEvent): void {
		const now = performance.now();

		if (now - lastTouchEnd <= 300) {
			event.preventDefault();
		}

		lastTouchEnd = now;
	}, { passive: false });



	const joystick = new Joystick(true, new Rectangle(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight));

	window.addEventListener("resize", function(): void {
		if (joystick.activeBounds) {
			joystick.activeBounds.width = document.documentElement.clientWidth;
			joystick.activeBounds.height = document.documentElement.clientHeight;
		}
	});
	

	const moving = {
		left: false,
		right: false,
		top: false,
		bottom: false,
		angle: 0,
	};


	joystick.moveCallback = (angle: number): void => {
		// Handle joystick angle as axis-aligned directions
		const isLeft = angle <= Math.PI / 3 || angle >= 5 * Math.PI / 3;
		const isRight = angle >= 2 * Math.PI / 3 && angle <= 4 * Math.PI / 3;
		const isUp = angle >= Math.PI / 6 && angle <= 5 * Math.PI / 6;
		const isDown = angle >= 7 * Math.PI / 6 && angle <= 11 * Math.PI / 6;


		if (isLeft) {
			if (!moving.left) {
				game.socket.emit("startMovingLeft");
				moving.left = true;
			}
		}
		
		else if (moving.left) {
			game.socket.emit("stopMovingLeft");
			moving.left = false;
		}


		if (isRight) {
			if (!moving.right) {
				game.socket.emit("startMovingRight");
				moving.right = true;
			}
		} 
		
		else if (moving.right) {
			game.socket.emit("stopMovingRight");
			moving.right = false;
		}


		if (isUp) {
			if (!moving.top) {
				game.socket.emit("startMovingUp");
				moving.top = true;
			}
		} 
		
		else if (moving.top) {
			game.socket.emit("stopMovingUp");
			moving.top = false;
		}


		if (isDown) {
			if (!moving.bottom) {
				game.socket.emit("startMovingDown");
				moving.bottom = true;
			}
		} 
		
		else if (moving.bottom) {
			game.socket.emit("stopMovingDown");
			moving.bottom = false;
		}


		if (angle != moving.angle) {
			const buffer = new MsgWriter(1);

			buffer.writeUint8(toUint8Angle(angle - Math.PI));

			game.socket.emit("playerAngle", buffer.bytes);
			moving.angle = angle;
		}
	};



	joystick.endCallback = (angle?: number): void => {
		if (moving.left) {
			game.socket.emit("stopMovingLeft");
			moving.left = false;
		}

		if (moving.right) {
			game.socket.emit("stopMovingRight");
			moving.right = false;
		}

		if (moving.top) {
			game.socket.emit("stopMovingUp");
			moving.top = false;
		}

		if (moving.bottom) {
			game.socket.emit("stopMovingDown");
			moving.bottom = false;
		}


		if (angle !== undefined && angle != moving.angle) {
			const buffer = new MsgWriter(1);

			buffer.writeUint8(toUint8Angle(angle - Math.PI));

			game.socket.emit("playerAngle", buffer.bytes);
			moving.angle = angle;
		}
	};
}



export { setMobileControls };