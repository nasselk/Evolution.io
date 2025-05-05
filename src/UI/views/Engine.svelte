<script lang="ts">
    import Grid from "../components/GridLayout.svelte";
    import ToolBar from "../components/ToolBar.svelte";
	import ToggleBar from "../components/ToggleBar.svelte";
	import ContextMenu from "../components/ContextMenu.svelte";
	import Window from "../components/Window.svelte";

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
	:global(:root) {
		--padding: 15px;
		--gap: 12px;
	}


	:global(:root) {
  /* Padding sizes */
  --padding-sm: 0.5rem;    /* 8px - Small padding */
  --padding-md: 1rem;      /* 16px - Medium/default padding */
  --padding-lg: 1.5rem;    /* 24px - Large padding */
  
  /* Font sizes */
  --font-sm: 0.875rem;     /* 14px - Small text */
  --font-md: 1rem;         /* 16px - Regular text */
  --font-lg: 1.25rem;      /* 20px - Large text */
  
  /* Border radius */
  --radius-sm: 4px;        /* Small rounding */
  --radius-md: 8px;        /* Medium rounding */
  --radius-lg: 16px;       /* Large rounding */
}

	:global(.editorBox) {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		background: rgba(50, 50, 50, 0.2);
		box-shadow: 0 0.25vmin 1vmin rgba(0, 0, 0, 0.25);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
		border: 0.25vmin solid rgba(150, 150, 150, 0.3);
		border-radius: 18px;
		box-sizing: border-box;
	}

	:global(.editorBox.pretty) {
		background: rgba(50, 50, 50, 0.2);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
	}

	:global(button:focus) {
		outline: none;
	}
</style>


<Grid id="editor" padding="var(--padding)" gap="var(--gap)" bottom_left_direction="row">
    {#snippet bottom_left()}
        <ToolBar id="editorTools" class="editorBox" { tools } />
		<ToggleBar id="editorToggles" class="editorBox" { toggles } />
    {/snippet}
</Grid>


<ContextMenu {menuItems} />