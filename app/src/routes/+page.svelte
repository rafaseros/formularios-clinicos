<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Formularios Clínicos — Proyecto Gilead Bolivia</title>
</svelte:head>

<div class="container">
	<header class="page-header">
		<h1>PROYECTO GILEAD BOLIVIA</h1>
		<p class="subtitle">PROGRAMA HOMBRES NUEVOS</p>
		<p class="description">Sistema de Formularios Clínicos — Expediente Clínico SEDES</p>
	</header>

	<div class="info-box">
		<h3>Instrucciones de Uso</h3>
		<p>
			Seleccione un formulario para visualizarlo. Desde la vista del formulario puede
			imprimirlo con <kbd>Ctrl+P</kbd> o guardarlo como PDF.
		</p>
	</div>

	{#each data.phases as phase}
		<section class="phase-section">
			<div class="phase-title">FASE {phase.number}: {phase.name}</div>
			<div class="form-grid">
				{#each phase.forms as form}
					<a href="/forms/{form.id}" class="form-card">
						<span class="form-code">{form.code}</span>
						<h3>{form.name}</h3>
						<p>{form.description}</p>
						<div class="form-meta">
							{#if (form.pageConfig as any)?.orientation === 'landscape'}
								<span class="badge">Apaisado</span>
							{/if}
							{#if form.pageCount > 1}
								<span class="badge">{form.pageCount} páginas</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<footer class="page-footer">
		<p>Versión 2.0 | 2026</p>
		<p>Proyecto Gilead Bolivia — Programa Hombres Nuevos</p>
		<p>Sistema de Formularios Clínicos SEDES</p>
	</footer>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 32px;
		padding-bottom: 16px;
		border-bottom: 3px solid #1F4E79;
	}

	.page-header h1 {
		color: #1F4E79;
		margin: 0;
		font-size: 28px;
	}

	.subtitle {
		font-weight: bold;
		color: #333;
		margin: 4px 0;
	}

	.description {
		color: #666;
		font-size: 14px;
		margin: 4px 0 0;
	}

	.info-box {
		background-color: #E3F2FD;
		border-left: 4px solid #2196F3;
		padding: 16px;
		margin-bottom: 32px;
		border-radius: 4px;
	}

	.info-box h3 {
		margin: 0 0 8px;
		color: #1976D2;
		font-size: 14px;
	}

	.info-box p {
		margin: 0;
		font-size: 14px;
		color: #333;
	}

	kbd {
		background: #eee;
		border: 1px solid #ccc;
		border-radius: 3px;
		padding: 1px 6px;
		font-family: monospace;
		font-size: 12px;
	}

	.phase-section {
		margin-bottom: 32px;
	}

	.phase-title {
		background-color: #1F4E79;
		color: white;
		padding: 10px 16px;
		font-size: 15px;
		font-weight: bold;
		border-radius: 4px;
		margin-bottom: 12px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 12px;
	}

	.form-card {
		display: block;
		border: 1px solid #ddd;
		padding: 16px;
		border-radius: 4px;
		background: white;
		text-decoration: none;
		color: inherit;
		transition: box-shadow 0.2s, border-color 0.2s;
	}

	.form-card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		border-color: #1F4E79;
	}

	.form-code {
		font-family: monospace;
		font-size: 11px;
		color: #999;
	}

	.form-card h3 {
		margin: 4px 0 8px;
		font-size: 15px;
		color: #1F4E79;
	}

	.form-card p {
		margin: 0;
		font-size: 12px;
		color: #666;
	}

	.form-meta {
		margin-top: 8px;
		display: flex;
		gap: 6px;
	}

	.badge {
		font-size: 10px;
		background: #f0f0f0;
		border: 1px solid #ddd;
		border-radius: 3px;
		padding: 2px 6px;
		color: #555;
	}

	.page-footer {
		text-align: center;
		color: #999;
		font-size: 12px;
		margin-top: 40px;
		padding-top: 16px;
		border-top: 1px solid #ddd;
	}

	.page-footer p {
		margin: 2px 0;
	}
</style>
