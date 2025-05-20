<script lang="ts">
	import Chart from "chart.js/auto";
	import { onMount } from "svelte";


	const {
		label,
		r,
		g,
		b,
	} = $props();


	let canvas: HTMLCanvasElement;
    let chart: Chart;


	function createChartConfig(datasetConfig: any): any {
        return {
            type: "line",
            data: {
                labels: [],
                datasets: [ datasetConfig ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 250
                },
				plugins: {
                    legend: {
                        display: true,
						labels: {
							color: "rgba(255, 255, 255, 0.7)",
							font: {
								size: 12
							}
						}
                    },
                },               
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                        ticks: { color: "rgba(255, 255, 255, 0.7)" },
                        alignToPixels: true,
                        display: false,
						min: function(context: any) {
                        	const data = context.chart.data.labels;
                        	return data && data.length > 15 ? data[data.length - 15] : 0;
                    	},
                    	max: function(context: any) {
                        	const data = context.chart.data.labels;
                        	return data && data.length ? data[data.length - 1] : 15;
                    	}
                    },
                    y: {
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                        ticks: { 
							color: "rgba(255, 255, 255, 0.7)",
							stepSize: 5,
						},
                    }
                }
            }
        };
    }

		
	function colorFade(r: number, g: number, b: number, context: any): any {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

		if (!chartArea) {
			return `rgba(${ r },${ g },${ b }, 0.2)`;
		}

        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, `rgba(${ r },${ g },${ b }, 0.5)`);
		gradient.addColorStop(1, `rgba(${ r },${ g },${ b }, 0)`);
            
        return gradient;
    }


    onMount(() => {
		chart = new Chart(canvas, createChartConfig({
			label: label,
            data: [],
            borderColor: `rgb(${ r }, ${ g }, ${ b })`,
			backgroundColor: (context: any) => colorFade(r, g, b, context),
            fill: true,
            tension: 0.4
		}));


     	return () => {
            chart.destroy();
        };
    });


	export function updateData(value: number): void {
    	const now = performance.now();
    
		chart.data.labels?.push(now);
		chart.data.datasets[0].data.push(value);

    	requestAnimationFrame(() => {
        	chart.update();
    	});
	}


	export function reset(): void {
		chart.data.labels = [];
		chart.data.datasets[0].data = [];

		requestAnimationFrame(() => {
			chart.update();
		});
	}
</script>



<style>
	:global(#HUD) {
		display: none;
	}
</style>



<canvas bind:this={canvas}></canvas>