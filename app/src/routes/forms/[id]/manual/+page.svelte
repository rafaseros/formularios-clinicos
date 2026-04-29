<script lang="ts">
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const form = $derived(data.form);
	const manual = $derived(data.manual);
	const user = $derived(data.user);
	const allVersions = $derived(data.allVersions);
	const isLatest = $derived(data.isLatest);
	const latestId = $derived(data.latestId);
	const pageConfig = $derived(manual.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});

	const canPrintManual = $derived(!!user && (user.canPrintManuals || user.role === 'admin'));

	function onVersionChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		if (select.value && Number(select.value) !== form.id) {
			goto(`/forms/${select.value}/manual`);
		}
	}
</script>

<svelte:head>
	<title>Manual — {form.code} v{form.version} {form.name}</title>
</svelte:head>

<div class="form-viewer">
	<header class="viewer-header">
		<div class="header-left">
			<a href="/forms/{form.id}" class="back-link">← Volver al formulario</a>
			<div class="form-info">
				<span class="form-code">Manual de {form.code} v{form.version}</span>
				<h1>{form.name}</h1>
				<p>Manual de llenado</p>
			</div>
		</div>
		<div class="header-actions">
			{#if allVersions.length > 1}
				<select class="version-select" value={form.id} onchange={onVersionChange} title="Cambiar versión">
					{#each allVersions as v}
						<option value={v.id}>v{v.version}{v.id === latestId ? ' (actual)' : ''}</option>
					{/each}
				</select>
			{/if}
			{#if canPrintManual}
				<a href="/api/forms/{form.id}/manual/pdf" target="_blank" class="btn btn-pdf">Descargar PDF</a>
				<a href="/forms/{form.id}/manual/print" target="_blank" class="btn btn-print">Imprimir manual</a>
			{/if}
		</div>
	</header>

	{#if !isLatest}
		<div class="historic-banner">
			<svg class="banner-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>
			<span>
				Estás viendo el manual de una versión histórica (v{form.version}).
				<a href="/forms/{latestId}/manual">Ver versión actual →</a>
			</span>
		</div>
	{/if}

	<div class="viewer-body">
		<LetterVisualizer
			iframeSrc="/forms/{form.id}/manual/print"
			iframeTitle="Manual {form.code}"
			orientation={pageConfig.orientation}
			margins={pageConfig.margins}
		/>
	</div>
</div>

<style>
	.form-viewer {
		min-height: calc(100vh - 52px);
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	.viewer-header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 10px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
		gap: 12px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--color-primary);
		text-decoration: none;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		transition: var(--transition);
	}

	.back-link:hover {
		background: var(--color-info-bg);
		text-decoration: none;
	}

	.form-info {
		border-left: 1px solid var(--color-border);
		padding-left: 14px;
		min-width: 0;
	}

	.form-code {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-text-subtle);
		display: block;
		margin-bottom: 2px;
	}

	.form-info h1 {
		font-size: 14px;
		font-weight: 600;
		margin: 0 0 2px;
		color: var(--color-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.form-info p {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-shrink: 0;
	}

	/* ─── Version selector ────────────────────────────── */
	.version-select {
		padding: 6px 10px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-family: var(--font-system);
		color: var(--color-text);
		background: var(--color-surface);
		cursor: pointer;
		transition: var(--transition);
	}

	.version-select:hover {
		border-color: var(--color-primary-light);
	}

	.version-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.08);
	}

	/* ─── Historic version banner ─────────────────────── */
	.historic-banner {
		background: #fffbeb;
		border-bottom: 1px solid #fcd34d;
		border-left: 3px solid #f59e0b;
		padding: 10px 20px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: #92400e;
		flex-shrink: 0;
	}

	.banner-icon {
		width: 16px;
		height: 16px;
		color: #d97706;
		flex-shrink: 0;
	}

	.historic-banner a {
		color: #92400e;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.historic-banner a:hover {
		color: #78350f;
	}

	.btn {
		display: inline-block;
		padding: 7px 14px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-system);
		text-decoration: none;
		transition: var(--transition);
		white-space: nowrap;
	}

	.btn-print {
		background: var(--color-surface);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.btn-print:hover {
		background: var(--color-info-bg);
	}

	.btn-pdf {
		background: var(--color-primary);
		color: white;
	}

	.btn-pdf:hover {
		background: var(--color-primary-light);
	}

	.viewer-body {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		overflow: auto;
	}

	@media (max-width: 768px) {
		.viewer-header {
			padding: 8px 12px;
			flex-wrap: wrap;
		}

		.header-left {
			gap: 8px;
			width: 100%;
		}

		.form-info {
			padding-left: 10px;
		}

		.header-actions {
			width: 100%;
			flex-wrap: wrap;
		}

		.viewer-body {
			padding: 12px;
			overflow-x: auto;
			justify-content: flex-start;
		}

		.historic-banner {
			padding: 10px 12px;
		}
	}
</style>
