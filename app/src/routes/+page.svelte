<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Formularios Clínicos — Proyecto Gilead Bolivia</title>
</svelte:head>

<div class="container">
	<header class="page-header">
		<div class="header-badge">Sistema de Formularios Clínicos</div>
		<h1>Proyecto Gilead Bolivia</h1>
		<p class="subtitle">Programa Hombres Nuevos</p>
		<p class="description">Expediente Clínico SEDES</p>
	</header>

	<div class="info-box">
		<svg class="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
		</svg>
		<div>
			<strong>Instrucciones de uso:</strong> Seleccione un formulario para visualizarlo. Desde la vista
			puede imprimirlo con <kbd>Ctrl+P</kbd> o guardarlo como PDF.
		</div>
	</div>

	{#each data.phases as phase}
		<section class="phase-section">
			<div class="phase-header">
				<span class="phase-number">Fase {phase.number}</span>
				<h2 class="phase-name">{phase.name}</h2>
			</div>
			<div class="form-grid">
				{#each phase.forms as form}
					<a href="/forms/{form.id}" class="form-card">
						<div class="card-top">
							<span class="form-code">{form.code}</span>
							<div class="form-badges">
								{#if (form.pageConfig as any)?.orientation === 'landscape'}
									<span class="badge badge-landscape">Apaisado</span>
								{/if}
								{#if form.pageCount > 1}
									<span class="badge badge-pages">{form.pageCount} págs.</span>
								{/if}
							</div>
						</div>
						<h3>{form.name}</h3>
						<p>{form.description}</p>
						<div class="card-arrow" aria-hidden="true">→</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<footer class="page-footer">
		<p>Versión 2.0 &middot; 2026</p>
		<p>Proyecto Gilead Bolivia — Programa Hombres Nuevos</p>
		<p>Sistema de Formularios Clínicos SEDES</p>
	</footer>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	/* ─── Header ──────────────────────────────────────── */
	.page-header {
		text-align: center;
		margin-bottom: 36px;
		padding-bottom: 28px;
		border-bottom: 1px solid var(--color-border);
	}

	.header-badge {
		display: inline-block;
		background: var(--color-info-bg);
		color: var(--color-info-text);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		padding: 4px 12px;
		border-radius: 20px;
		border: 1px solid var(--color-info-border);
		margin-bottom: 12px;
	}

	.page-header h1 {
		color: var(--color-primary);
		margin: 0 0 4px;
		font-size: clamp(22px, 4vw, 30px);
		font-weight: 700;
		letter-spacing: -0.3px;
	}

	.subtitle {
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 2px;
		font-size: 15px;
	}

	.description {
		color: var(--color-text-muted);
		font-size: 13px;
		margin: 0;
	}

	/* ─── Info box ────────────────────────────────────── */
	.info-box {
		background: var(--color-info-bg);
		border: 1px solid var(--color-info-border);
		border-left-width: 3px;
		padding: 14px 16px;
		margin-bottom: 32px;
		border-radius: var(--radius-md);
		display: flex;
		gap: 10px;
		align-items: flex-start;
		font-size: 13px;
		color: var(--color-text);
		line-height: 1.5;
	}

	.info-icon {
		width: 18px;
		height: 18px;
		color: var(--color-info-text);
		flex-shrink: 0;
		margin-top: 1px;
	}

	kbd {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 1px 6px;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-text);
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
	}

	/* ─── Phase sections ──────────────────────────────── */
	.phase-section {
		margin-bottom: 40px;
	}

	.phase-header {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 14px;
		padding-bottom: 10px;
		border-bottom: 2px solid var(--color-primary);
	}

	.phase-number {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-primary);
		background: var(--color-info-bg);
		padding: 3px 10px;
		border-radius: 20px;
		white-space: nowrap;
	}

	.phase-name {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	/* ─── Form grid ───────────────────────────────────── */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}

	/* ─── Form card ───────────────────────────────────── */
	.form-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		padding: 18px;
		border-radius: var(--radius-md);
		background: var(--color-surface);
		text-decoration: none;
		color: inherit;
		transition: var(--transition);
		box-shadow: var(--shadow-sm);
		position: relative;
	}

	.form-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary-light);
		transform: translateY(-2px);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
		gap: 8px;
	}

	.form-code {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-text-subtle);
		letter-spacing: 0.3px;
		flex-shrink: 0;
	}

	.form-card h3 {
		margin: 0 0 6px;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-primary);
		line-height: 1.35;
	}

	.form-card p {
		margin: 0;
		font-size: 12px;
		color: var(--color-text-muted);
		line-height: 1.5;
		flex: 1;
	}

	.form-badges {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.badge {
		font-size: 10px;
		font-weight: 600;
		border-radius: 4px;
		padding: 2px 7px;
		white-space: nowrap;
	}

	.badge-landscape {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fcd34d;
	}

	.badge-pages {
		background: var(--color-bg);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.card-arrow {
		margin-top: 12px;
		font-size: 16px;
		color: var(--color-primary-light);
		opacity: 0;
		transition: opacity 0.15s ease, transform 0.15s ease;
		transform: translateX(-4px);
		text-align: right;
	}

	.form-card:hover .card-arrow {
		opacity: 1;
		transform: translateX(0);
	}

	/* ─── Footer ──────────────────────────────────────── */
	.page-footer {
		text-align: center;
		color: var(--color-text-subtle);
		font-size: 12px;
		margin-top: 48px;
		padding-top: 20px;
		border-top: 1px solid var(--color-border);
	}

	.page-footer p {
		margin: 3px 0;
	}

	/* ─── Responsive ──────────────────────────────────── */
	@media (max-width: 1024px) {
		.form-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.container {
			padding: 20px 16px;
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.form-card {
			padding: 14px;
		}

		.form-card:hover {
			transform: none;
		}

		.phase-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 6px;
		}

		.info-box {
			flex-direction: column;
			gap: 6px;
		}

		.info-icon {
			display: none;
		}
	}
</style>
