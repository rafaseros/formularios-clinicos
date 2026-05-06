<script lang="ts">
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const left = $derived(data.left);
	const right = $derived(data.right);
	const allVersions = $derived(data.allVersions);
	const changelog = $derived(data.changelog);
	const rightIsLatest = $derived(data.rightIsLatest);

	const leftPageConfig = $derived(left.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});
	const rightPageConfig = $derived(right.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});

	// Other versions to show in the "compare against" selector (excluding the left/current)
	const otherVersionOptions = $derived(allVersions.filter((v) => v.id !== left.id));

	function onRightVersionChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const selectedId = Number(select.value);
		if (selectedId && selectedId !== right.id) {
			goto(`/forms/${left.id}/compare/${selectedId}`);
		}
	}

	// Parse changelog lines for display
	const changelogLines = $derived(changelog ? changelog.split('\n') : []);
</script>

<svelte:head>
	<title>Comparar {left.code} v{left.version} vs v{right.version}</title>
</svelte:head>

<div class="compare-page">
	<header class="compare-header">
		<div class="header-left">
			<a href="/forms/{left.id}" class="back-link">← Volver al formulario</a>
			<div class="compare-title">
				<span class="form-code">{left.code}</span>
				<h1>Comparar v{left.version} vs v{right.version}</h1>
			</div>
		</div>
		<div class="header-right">
			{#if otherVersionOptions.length > 0}
				<label class="compare-label" for="right-version-select">Comparar contra:</label>
				<select
					id="right-version-select"
					class="version-select"
					value={right.id}
					onchange={onRightVersionChange}
					title="Cambiar versión a comparar"
				>
					{#each otherVersionOptions as v}
						<option value={v.id}>v{v.version}{v.id === data.latestId ? ' (actual)' : ''}</option>
					{/each}
				</select>
			{/if}
		</div>
	</header>

	{#if changelog}
		<div class="changelog-box">
			<h2 class="changelog-heading">📋 Changelog del formulario</h2>
			<div class="changelog-content">
				{#each changelogLines as line}
					{#if line.startsWith('## ')}
						<p class="cl-h2">{line.slice(3)}</p>
					{:else if line.startsWith('# ')}
						<p class="cl-h1">{line.slice(2)}</p>
					{:else if line.startsWith('**') && line.endsWith('**')}
						<p class="cl-bold">{line.slice(2, -2)}</p>
					{:else if line.startsWith('- ')}
						<p class="cl-bullet">{line.slice(2)}</p>
					{:else if line.trim() === ''}
						<div class="cl-spacer"></div>
					{:else}
						<p class="cl-text">{line}</p>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<div class="compare-grid">
		<div class="compare-cell">
			<div class="cell-label">
				<span class="version-badge">v{left.version}</span>
				<span class="version-note">versión seleccionada</span>
			</div>
			<div class="visualizer-wrap">
				<LetterVisualizer
					iframeSrc="/forms/{left.id}/print"
					iframeTitle="Formulario {left.code} v{left.version}"
					orientation={leftPageConfig.orientation}
					margins={leftPageConfig.margins}
				/>
			</div>
		</div>

		<div class="compare-cell">
			<div class="cell-label">
				<span class="version-badge version-badge-right">v{right.version}</span>
				{#if rightIsLatest}
					<span class="version-note version-note-latest">actual</span>
				{:else}
					<span class="version-note">versión histórica</span>
				{/if}
			</div>
			<div class="visualizer-wrap">
				<LetterVisualizer
					iframeSrc="/forms/{right.id}/print"
					iframeTitle="Formulario {right.code} v{right.version}"
					orientation={rightPageConfig.orientation}
					margins={rightPageConfig.margins}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.compare-page {
		min-height: calc(100vh - 52px);
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	/* ─── Header ──────────────────────────────────────── */
	.compare-header {
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

	.compare-title {
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

	.compare-title h1 {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
		color: var(--color-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.compare-label {
		font-size: 12px;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

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

	/* ─── Changelog box ───────────────────────────────── */
	.changelog-box {
		background: var(--color-info-bg);
		border-bottom: 1px solid var(--color-info-border);
		border-left: 3px solid var(--color-primary);
		padding: 16px 24px;
		flex-shrink: 0;
	}

	.changelog-heading {
		font-size: 13px;
		font-weight: 700;
		color: var(--color-primary);
		margin: 0 0 12px;
		letter-spacing: 0.02em;
	}

	.changelog-content {
		max-width: 900px;
	}

	.cl-h1 {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-primary);
		margin: 8px 0 4px;
	}

	.cl-h2 {
		font-size: 13px;
		font-weight: 700;
		color: var(--color-text);
		margin: 10px 0 4px;
		padding-top: 4px;
		border-top: 1px solid var(--color-info-border);
	}

	.cl-bold {
		font-size: 12px;
		font-weight: 700;
		color: var(--color-text);
		margin: 4px 0 2px;
	}

	.cl-bullet {
		font-size: 12px;
		color: var(--color-text);
		margin: 2px 0 2px 16px;
		padding-left: 4px;
		line-height: 1.5;
	}

	.cl-bullet::before {
		content: '•';
		margin-right: 6px;
		color: var(--color-primary);
	}

	.cl-text {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 2px 0;
		line-height: 1.5;
	}

	.cl-spacer {
		height: 6px;
	}

	/* ─── Side-by-side grid ───────────────────────────── */
	.compare-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		overflow: auto;
	}

	.compare-cell {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border);
		min-width: 0;
	}

	.compare-cell:last-child {
		border-right: none;
	}

	.cell-label {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.version-badge {
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 2px 8px;
		color: var(--color-text);
	}

	.version-badge-right {
		background: var(--color-info-bg);
		border-color: var(--color-info-border);
		color: var(--color-primary);
	}

	.version-note {
		font-size: 11px;
		color: var(--color-text-subtle);
	}

	.version-note-latest {
		color: var(--color-info-text, var(--color-primary));
		font-weight: 600;
	}

	.visualizer-wrap {
		flex: 1;
		padding: 20px 16px;
		overflow: auto;
		background: var(--color-bg);
	}

	/* ─── Responsive ──────────────────────────────────── */
	@media (max-width: 900px) {
		.compare-header {
			padding: 8px 12px;
			flex-wrap: wrap;
		}

		.header-left {
			width: 100%;
			gap: 8px;
		}

		.header-right {
			width: 100%;
		}

		.compare-grid {
			grid-template-columns: 1fr;
		}

		.compare-cell {
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}

		.compare-cell:last-child {
			border-bottom: none;
		}

		.changelog-box {
			padding: 12px 14px;
		}
	}
</style>
