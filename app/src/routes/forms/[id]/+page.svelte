<script lang="ts">
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';

	let { data } = $props();
	const form = $derived(data.form);
	const pageConfig = $derived(form.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});
</script>

<svelte:head>
	<title>{form.code} — {form.name}</title>
</svelte:head>

<div class="form-viewer">
	<header class="viewer-header">
		<div class="header-left">
			<a href="/" class="back-link">← Volver</a>
			<div class="form-info">
				<span class="form-code">{form.code}</span>
				<h1>{form.name}</h1>
				<p>{form.description}</p>
			</div>
		</div>
		<div class="header-actions">
			<a
				href="/api/forms/{form.id}/pdf"
				target="_blank"
				rel="noopener"
				class="btn btn-pdf"
			>
				Descargar PDF
			</a>
			<a
				href="/forms/{form.id}/print"
				target="_blank"
				rel="noopener"
				class="btn btn-print"
			>
				Imprimir / PDF
			</a>
		</div>
	</header>

	<div class="viewer-body">
		<LetterVisualizer
			formId={form.id}
			orientation={pageConfig.orientation}
		/>
	</div>
</div>

<style>
	.form-viewer {
		min-height: 100vh;
		background-color: #e8e8e8;
		display: flex;
		flex-direction: column;
	}

	.viewer-header {
		background: white;
		border-bottom: 1px solid #ddd;
		padding: 12px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.back-link {
		color: #1F4E79;
		text-decoration: none;
		font-size: 14px;
		white-space: nowrap;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.form-info {
		border-left: 1px solid #ddd;
		padding-left: 16px;
	}

	.form-code {
		font-family: monospace;
		font-size: 12px;
		color: #666;
	}

	.form-info h1 {
		font-size: 16px;
		margin: 2px 0;
		color: #1F4E79;
	}

	.form-info p {
		font-size: 12px;
		color: #888;
		margin: 0;
	}

	.btn-pdf {
		display: inline-block;
		padding: 8px 20px;
		background-color: #2E7D32;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.btn-pdf:hover {
		background-color: #1B5E20;
	}

	.btn-print {
		display: inline-block;
		padding: 8px 20px;
		background-color: #1F4E79;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.btn-print:hover {
		background-color: #1565C0;
	}

	.viewer-body {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		overflow: auto;
	}
</style>
