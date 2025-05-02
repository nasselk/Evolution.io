<script lang="ts">
	import { Vector } from "../../utils/math/vector";


  	const {
    	id = "",
    	class: classList = "",
    	x = "0px",
    	y = "0px",
    	width = "400px",
    	height = "300px",
    	minWidth = "200px",
    	minHeight = "150px",
    	maxWidth = "500px",
    	maxHeight = "500px",
		children = () => {},
		directions = [
			"n",
			"e",
			"s",
			"w",
			"nw",
			"ne",
			"sw",
			"se"
		]
  	} = $props();


  	// Initialize state with parsed values and export it
  	const state = $state({
    	x: parseInt(x),
    	y: parseInt(y),
    	width: parseInt(width),
    	height: parseInt(height),
  	});

  	let isResizing = false;
  	let activePointerId = -1;
  	let resizeDirection: keyof typeof resizeHandlers;
  	const startBox = { x: 0, y: 0, width: 0, height: 0 };
  	const startPointer = new Vector();


  	const resizeHandlers = {
    	n:  (dx: number, dy: number): void => {
      		const newHeight = startBox.height - dy;
      		const constrainedHeight = Math.min(Math.max(newHeight, parseFloat(minHeight)), parseFloat(maxHeight));
      		const actualDy = startBox.height - constrainedHeight;
      		state.height = constrainedHeight;
      		state.y = startBox.y + actualDy;
    	},
    	e: (dx: number, dy: number): void => {
      		state.width = Math.max(startBox.width + dx, parseFloat(minWidth));
    	},
    	s: (dx: number, dy: number): void => {
      		state.height = Math.max(startBox.height + dy, parseFloat(minHeight));
    	},
    	w: (dx: number, dy: number): void => {
      		const newWidth = startBox.width - dx;
      		const constrainedWidth = Math.min(Math.max(newWidth, parseFloat(minWidth)), parseFloat(maxWidth));
      		const actualDx = startBox.width - constrainedWidth;
      		state.width = constrainedWidth;
      		state.x = startBox.x + actualDx;
    	},
    	nw: (dx: number, dy: number): void => {
      		resizeHandlers.n(dx, dy);
      		resizeHandlers.w(dx, dy);
    	},
    	ne: (dx: number, dy: number): void => {
      		resizeHandlers.n(dx, dy);
      		resizeHandlers.e(dx, dy);
    	},
    	sw: (dx: number, dy: number): void => {
     	 	resizeHandlers.s(dx, dy);
      		resizeHandlers.w(dx, dy);
    	},
    	se: (dx: number, dy: number): void => {
      		resizeHandlers.s(dx, dy);
      		resizeHandlers.e(dx, dy);
    	}
  	};

  	function startResize(event: PointerEvent, direction: keyof typeof resizeHandlers): void {
		if (directions.includes(direction)) {
			activePointerId = event.pointerId;
    		resizeDirection = direction;
			isResizing = true;

    		startBox.x = state.x;
    		startBox.y = state.y;
    		startBox.width = state.width;
    		startBox.height = state.height; 

    		startPointer.set(event.clientX, event.clientY);

    		document.addEventListener("pointermove", handlePointerMove);
    		document.addEventListener("pointerup", stopInteraction);
    		document.addEventListener("pointercancel", stopInteraction);
		}
  	}

  	function handlePointerMove(event: PointerEvent): void {
    	if (isResizing && event.pointerId === activePointerId) {
      		const dx = event.clientX - startPointer.x;
      		const dy = event.clientY - startPointer.y;
      		resizeHandlers[resizeDirection](dx, dy);
    	}
  	}

  	function stopInteraction(): void {
    	isResizing = false;
    	activePointerId = -1;
    	document.removeEventListener("pointermove", handlePointerMove);
    	document.removeEventListener("pointerup", stopInteraction);
    	document.removeEventListener("pointercancel", stopInteraction);
  	}

	export function getPosition(): { x: number; y: number } {
		return { x: state.x, y: state.y };
  	}

  	export function setPosition(x: number, y: number): void {
		state.x = x;
		state.y = y;
  	}

	export function getSize(): { width: number; height: number } {
		return { width: state.width, height: state.height };
  	}

	export function setSize(width: number, height: number): void {
		state.width = width;
		state.height = height;
  	}
</script>


<style>
  	.resizable-box {
    	position: absolute;
  	}

  	.resize-handle {
    	position: absolute;
    	z-index: 2;
  	}

  	.resize-handle.n { top: -5px; left: 0; right: 0; height: 10px; cursor: n-resize; }
  	.resize-handle.e { top: 0; right: -5px; bottom: 0; width: 10px; cursor: e-resize; }
  	.resize-handle.s { bottom: -5px; left: 0; right: 0; height: 10px; cursor: s-resize; }
  	.resize-handle.w { top: 0; left: -5px; bottom: 0; width: 10px; cursor: w-resize; }
  	.resize-handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
  	.resize-handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
  	.resize-handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
  	.resize-handle.se { bottom: -5px; right: -5px; cursor: se-resize; }
  	.resize-handle.nw, .resize-handle.ne, .resize-handle.sw, .resize-handle.se {
    	width: 15px;
    	height: 15px;
  	}

  	.content {
    	width: 100%;
    	height: 100%;
    	position: relative;
    	overflow: auto;
  	}
</style>


<div
	id={id}
  	class="resizable-box {classList}"
  	style="
    	left: {state.x}px;
    	top: {state.y}px;
    	width: {state.width}px;
    	height: {state.height}px;
    	min-width: {minWidth};
    	min-height: {minHeight};
    	max-width: {maxWidth};
    	max-height: {maxHeight};
  	"
	>

  	{#each Object.keys(resizeHandlers) as direction}
	  	{#if directions.includes(direction)}
    		<div class="resize-handle {direction}" onpointerdown={e => startResize(e, direction)} role="button"></div>
		{/if}
  	{/each}

  	{@render children()}
</div>