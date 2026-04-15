<script lang="ts">
	let props: { formId: number; orientation?: string } = $props();

	// Letter size in cm: 21.59 x 27.94
	const CM_TO_PX = 37.795;
	const isLandscape = $derived(props.orientation === 'landscape');
	const paperWidth = $derived((isLandscape ? 27.94 : 21.59) * CM_TO_PX);
	const paperHeight = $derived((isLandscape ? 21.59 : 27.94) * CM_TO_PX);
</script>

<div class="paper-wrapper">
	<div
		class="paper"
		style="width: {paperWidth}px; height: {paperHeight}px;"
	>
		<iframe
			src="/forms/{props.formId}/print"
			title="Formulario"
			style="width: {paperWidth}px; height: {paperHeight}px;"
		></iframe>
	</div>
</div>

<style>
	.paper-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.paper {
		background: white;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		flex-shrink: 0;
	}

	iframe {
		border: none;
		display: block;
	}
</style>
