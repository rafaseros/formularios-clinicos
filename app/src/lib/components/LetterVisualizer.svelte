<script lang="ts">
	import { onMount } from 'svelte';

	let props: {
		formId: number;
		orientation?: string;
		margins?: { top: string; right: string; bottom: string; left: string };
	} = $props();

	// Letter size in cm: 21.59 x 27.94
	const CM_TO_PX = 37.795;
	const isLandscape = $derived(props.orientation === 'landscape');
	const paperWidth = $derived((isLandscape ? 27.94 : 21.59) * CM_TO_PX);
	const paperHeight = $derived((isLandscape ? 21.59 : 27.94) * CM_TO_PX);

	// Parse margin values (e.g. "2.5cm" → px)
	function cmToPx(value: string): number {
		const num = parseFloat(value);
		return isNaN(num) ? 0 : num * CM_TO_PX;
	}

	// Default margins match the @page rules from common.css
	const margins = $derived(props.margins ?? (
		isLandscape
			? { top: '1.5cm', right: '2.0cm', bottom: '1.5cm', left: '3.0cm' }
			: { top: '2.5cm', right: '2.5cm', bottom: '2.5cm', left: '3.0cm' }
	));
	const marginTop = $derived(cmToPx(margins.top));
	const marginRight = $derived(cmToPx(margins.right));
	const marginBottom = $derived(cmToPx(margins.bottom));
	const marginLeft = $derived(cmToPx(margins.left));

	// The iframe content area is the paper minus margins
	const contentWidth = $derived(paperWidth - marginLeft - marginRight);
	const contentHeight = $derived(paperHeight - marginTop - marginBottom);

	// Responsive scaling
	let containerEl: HTMLDivElement | undefined = $state();
	let scale = $state(1);

	function updateScale() {
		if (!containerEl) return;
		const available = containerEl.clientWidth;
		if (available <= 0) return;
		const padding = 32; // 16px each side within the outer viewer-body
		const maxWidth = available - padding;
		const newScale = Math.min(1, maxWidth / paperWidth);
		scale = newScale;
	}

	let resizeObserver: ResizeObserver | undefined;

	onMount(() => {
		resizeObserver = new ResizeObserver(updateScale);
		if (containerEl) {
			resizeObserver.observe(containerEl);
		}
		updateScale();

		return () => {
			resizeObserver?.disconnect();
		};
	});

	const scaledHeight = $derived(paperHeight * scale);
</script>

<div class="paper-outer" bind:this={containerEl}>
	<div
		class="paper-scaler"
		style="width: {paperWidth}px; height: {paperHeight}px; transform: scale({scale}); transform-origin: top left;"
	>
		<div
			class="paper"
			style="width: {paperWidth}px; height: {paperHeight}px;"
		>
			<div
				class="paper-margins"
				style="
					padding: {marginTop}px {marginRight}px {marginBottom}px {marginLeft}px;
					width: {paperWidth}px;
					height: {paperHeight}px;
				"
			>
				<iframe
					src="/forms/{props.formId}/print"
					title="Formulario"
					style="width: {contentWidth}px; height: {contentHeight}px;"
				></iframe>
			</div>
		</div>
	</div>
	<!-- Spacer so container respects scaled height -->
	<div class="paper-spacer" style="height: {scaledHeight}px;"></div>
</div>

<style>
	.paper-outer {
		width: 100%;
		position: relative;
	}

	.paper-scaler {
		position: absolute;
		top: 0;
		left: 0;
	}

	.paper-spacer {
		width: 100%;
	}

	.paper {
		background: white;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		flex-shrink: 0;
	}

	.paper-margins {
		box-sizing: border-box;
	}

	iframe {
		border: none;
		display: block;
	}
</style>
