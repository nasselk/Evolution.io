<script lang="ts">
	// Views
	import Menu from "./views/Menu.svelte";
	import HUD from "./views/HUD.svelte";
	import Engine from "./views/Engine.svelte";


	// Disable right-click context menu
	document.addEventListener("contextmenu", (event) => {
		event.preventDefault();
	});


	// Disable zoom
	document.addEventListener("wheel", (event) => {
		if (event.ctrlKey) {
			event.preventDefault();
		}
	}, { passive: false });
</script>



<Engine></Engine>
<Menu></Menu>
<HUD></HUD>