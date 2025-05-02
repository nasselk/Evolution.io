<script lang="ts">
    import Grid from "../components/GridLayout.svelte";
	import ActionBar from "../components/ActionBar.svelte";
    import ToolBar from "../components/ToolBar.svelte";
	import ToggleBar from "../components/ToggleBar.svelte";
	import ContextMenu from "../components/ContextMenu.svelte";
	import Window from "../components/Window.svelte";

	import { actions } from "../stores/action";
	import { toggles } from "../stores/toggle";
	import { tools } from "../stores/tool";


	// When using clicks on ctrl, it should hide/show the editor menu
	let fadeTimeout: NodeJS.Timeout | null = null;
	
	window.addEventListener("keydown", (event) => {
		if (event.key === "Control") {
			if (fadeTimeout) {
				clearTimeout(fadeTimeout);
			}

			const editor = document.querySelector<HTMLDivElement>("#editor");
			const menu = document.querySelector<HTMLDivElement>("#editorMenu");
			const toolbar = document.querySelector<HTMLDivElement>("#editorTools");
			const togglebar = document.querySelector<HTMLDivElement>("#editorToggles");
			const actionbar = document.querySelector<HTMLDivElement>("#editorActions");

			if (!menu?.classList.contains("hidden")) {
				fadeTimeout = setTimeout(() => {
					editor?.style.setProperty("display", "none");
				}, 300);
			} 
			
			else {
				editor?.style.setProperty("display", "grid");
			}

			// Force a reflow to ensure the transition is applied
			void editor?.getBoundingClientRect();

			menu?.classList.toggle("hidden");
			toolbar?.classList.toggle("hidden");
			togglebar?.classList.toggle("hidden");
			actionbar?.classList.toggle("hidden");
		}
	});



	 const menuItems = [
        // Category 1: File operations
        [
            { 
                id: 'new', 
                label: 'New File', 
                icon: '/icons/new-file.png',
                callback: () => console.log('New file') 
            },
            { 
                id: 'open', 
                label: 'Open', 
                icon: '/icons/open.png',
                callback: () => console.log('Open file') 
            },
        ],
        // Category 2: Edit operations
        [
            { 
                id: 'copy', 
                label: 'Copy', 
                icon: '/icons/copy.png',
                callback: () => console.log('Copy') 
            },
            { 
                id: 'paste', 
                label: 'Paste', 
                icon: '/icons/paste.png',
                disabled: true,
                callback: () => console.log('Paste') 
            },
        ]
    ];
</script>


<style>
	:global(.editorBox) {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		background: rgba(50, 50, 50, 0.2);
		box-shadow: 0 0.25vmin 1vmin rgba(0, 0, 0, 0.25);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
		border: 0.25vmin solid rgba(150, 150, 150, 0.3);
		border-radius: 2vmin;
	}

	:global(button:focus) {
		outline: none;
	}
</style>


<Grid id="editor" padding=2vw gap=1vw bottom_left_direction="row">
    {#snippet bottom_left()}
        <ToolBar id="editorTools" class="editorBox" { tools } />
		<ToggleBar id="editorToggles" class="editorBox" {toggles} />
    {/snippet}
</Grid>



<ContextMenu {menuItems} />