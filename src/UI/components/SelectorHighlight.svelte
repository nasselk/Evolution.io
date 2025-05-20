<script lang="ts">
	let style = $state("");

	let lastTarget: HTMLElement | undefined;

    export function updateHighlight(pressed: boolean = false, active: boolean = true, target?: HTMLElement): string | void {		
		if (!target) {
			target = lastTarget;
		}

		else {
			lastTarget = target;
		}
		
		if (target) {
			const rect = target.getBoundingClientRect();
    
           	const width = rect.width * 1.225 + (pressed ? 10 : 0);	
           	const height = rect.height * 1.225;
    
           	const offsetWidth = width - rect.width;
           	const offsetHeight = height - rect.height;
    
           	return style = `
               	left: ${ target.offsetLeft - offsetWidth / 2 }px;
               	top: ${ target.offsetTop - offsetHeight / 2 }px;
               	width: ${ width }px;
               	height: ${ height }px;
				transform: scale(${active ? 1 : 0});
                opacity: ${active ? 1 : 0};
           	`;
		}
    }
</script>


<style>
	.highlight {
        position: absolute;
        box-sizing: border-box;
        background-color: rgba(255, 165, 0, 0.25);
        border: var(--border-md) rgba(255, 165, 0, 0.5);
		transform-origin: center center;
        transition: all 0.3s ease;
		transform: scale(0);
		border-radius: var(--radius-md);
		opacity: 0;
    }
</style>


<div class="highlight" style={style}></div>