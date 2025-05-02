<script lang="ts">
	import { Vector } from "../../utils/math/vector";
  	import ResizableBox from "./ResizableBox.svelte";


  	const {
    	id = "",
    	class: classList = "",
    	title = "Window",
    	isOpen = true,
    	x = null,
    	y = null,
    	width = "400px",
    	height = "300px",
    	minWidth = "200px",
    	minHeight = "150px",
    	padding = "16px",
    	maxWidth = "1200px",
    	maxHeight = "800px",
		children = () => {},
  	} = $props();


  	let box: ResizableBox;
	let originalSize = {};
	let isMinimized = $state(false);
	let zIndex = $state(10);
  	let isDragging = false;
 	let activePointerId = -1;
  	const dragOffset = new Vector();


  	function startDrag(event: PointerEvent): void {
    	if (event.target?.classList.contains("controls")) return;

    	isDragging = true;
    	activePointerId = event.pointerId;

		const position = box.getPosition();

    	dragOffset.set(
      		event.clientX - position.x,
      		event.clientY - position.y
    	);

    	document.addEventListener("pointermove", handlePointerMove);
    	document.addEventListener("pointerup", stopInteraction);
    	document.addEventListener("pointercancel", stopInteraction);
    	event.preventDefault();
  	}


  	function handlePointerMove(event: PointerEvent): void {
    	if (isDragging && event.pointerId === activePointerId) {
			box.setPosition(
				event.clientX - dragOffset.x,
				event.clientY - dragOffset.y
			)
			
      		event.preventDefault();
    	}
 	}


  	function stopInteraction() {
    	isDragging = false;
    	activePointerId = -1;

    	document.removeEventListener("pointermove", handlePointerMove);
    	document.removeEventListener("pointerup", stopInteraction);
    	document.removeEventListener("pointercancel", stopInteraction);
  	}


	function minimizeWindow() {
    if (!isMinimized) {
      originalSize =  box.getSize();
      isMinimized = true;

	  //get the height of the header
	  const header = document.querySelector(".header");
	  const headerHeight = header ? header.clientHeight : 0;


	  box.setSize(originalSize.width, headerHeight - 1);
    }
  }
  
  function expandWindow() {
    if (isMinimized) {
      isMinimized = false;

		box.setSize(originalSize.width, originalSize.height);
	}
  }


  	function closeWindow() {
    	// You could dispatch an event here for parent components to handle
  	}
</script>


<style>
	:global(.window) {
    	display: flex;
    	flex-direction: column;
    	overflow: hidden;
    	transition: box-shadow 0.2s ease;
    	width: 100%;
    	height: 100%;
  	}

  	:global(.window):hover {
    	box-shadow: 0 0.35vmin 1.5vmin rgba(0, 0, 0, 0.3), 0 0.75vmin 3vmin rgba(0, 0, 0, 0.2);
  	}

  	.header {
    	background: rgba(60, 60, 60, 0.5);
    	padding: 1vmin 1.5vmin;
    	display: flex;
    	align-items: center;
    	justify-content: space-between;
    	cursor: move;
    	border-bottom: 0.15vmin solid rgba(150, 150, 150, 0.3);
  	}

  	.title {
    	font-weight: 500;
    	font-size: 0.9rem;
    	color: rgba(255, 255, 255, 0.9);
    	overflow: hidden;
    	text-overflow: ellipsis;
    	white-space: nowrap;
    	letter-spacing: 0.05rem;
  	}

  	.close {
   		background: rgba(255, 80, 80, 0.9);
    	border: none;
    	cursor: pointer;
    	width: 1.1rem;
    	height: 1.1rem;
    	border-radius: 50%;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	transition: all 0.2s ease;
    	position: relative;
  	}

  	.close:hover {
    	background: rgba(255, 60, 60, 1);
    	transform: scale(1.1);
  	}

  	.close::before, .close::after {
    	content: "";
    	position: absolute;
    	width: 0.55rem;
    	height: 0.1rem;
    	background: rgba(255, 255, 255, 0);
    	transition: all 0.2s ease;
  	}

  	.close:hover::before, .close:hover::after {
    	background: rgba(255, 255, 255, 0.8);
  	}

  	.close:hover::before {
    	transform: rotate(45deg);
  	}

  	.close:hover::after {
    	transform: rotate(-45deg);
  	}

  	.content {
    	flex: 1;
    	overflow: auto;
    	color: rgba(255, 255, 255, 0.9);
    	padding: var(--padding);
  	}


	.controls {
    	display: flex;
    	gap: 0.5rem;
    	align-items: center;
  	}
  
  	.minimize {
    	background: rgba(255, 191, 0, 0.9);
    	border: none;
    	cursor: pointer;
    	width: 1.1rem;
    	height: 1.1rem;
    	border-radius: 50%;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	transition: all 0.2s ease;
    	position: relative;
  	}	
  
  	.minimize:hover {
    	background: rgba(255, 191, 0, 1);
    	transform: scale(1.1);
  	}

  	.minimize::before {
    	content: "";
    	position: absolute;
    	width: 0.55rem;
    	height: 0.1rem;
    	background: rgba(255, 255, 255, 0);
    	transition: all 0.2s ease;
  	}
  
  	.minimize:hover::before {
    	background: rgba(255, 255, 255, 0.8);
  	}
  
  	.expand {
    	background: rgba(32, 194, 14, 0.9);
    	border: none;
    	cursor: pointer;
    	width: 1.1rem;
    	height: 1.1rem;
    	border-radius: 50%;
    	display: flex;
    		align-items: center;
    	justify-content: center;
    	transition: all 0.2s ease;
    	position: relative;
  	}
  
  	.expand:hover {
    	background: rgba(32, 194, 14, 1);
    	transform: scale(1.1);
  	}
  
  	.expand::before, .expand::after {
    	content: "";
    	position: absolute;
    	background: rgba(255, 255, 255, 0);
    	transition: all 0.2s ease;
  	}
  
  	.expand:hover::before, .expand:hover::after {
    	background: rgba(255, 255, 255, 0.8);
  	}
  
  	.expand:hover::before {
    	width: 0.55rem;
    	height: 0.1rem;
  	}
  
  	.expand:hover::after {
    	width: 0.1rem;
    	height: 0.55rem;
  	}
</style>



{#if isOpen}
  	<ResizableBox
    	id={id}
    	class="window {classList}"
    	x="{x}px"
    	y="{y}px"
    	width={width}
    	height={height}
    	minWidth={minWidth}
    	minHeight={minHeight}
    	maxWidth={maxWidth}
    	maxHeight={maxHeight}
		bind:this={box}
  	>
		<div style="z-index: {zIndex}">
      		<div class="header" onpointerdown={startDrag}>
        		<div class="title">{title}</div>
        		<div class="controls">
          			{#if isMinimized}
            			<button class="expand" onclick={expandWindow} aria-label="Expand window"></button>
          			{:else}
            			<button class="minimize" onclick={minimizeWindow} aria-label="Minimize window"></button>
          			{/if}
          			<button class="close" onclick={closeWindow} aria-label="Close window"></button>
       			</div>
     		</div>
      		<div class="content" style="--padding: {padding};">
        		{@render children()}
      		</div>
    	</div>
  	</ResizableBox>
{/if}