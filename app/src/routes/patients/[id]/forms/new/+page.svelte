<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	const patient = $derived(data.patient);
	const templates = $derived(data.templates);

	// Group templates by phase
	const phases = $derived(() => {
		const map = new Map<number, { name: string; templates: typeof templates }>();
		for (const t of templates) {
			if (!map.has(t.phase)) {
				map.set(t.phase, { name: t.phaseName, templates: [] });
			}
			map.get(t.phase)!.templates.push(t);
		}
		return Array.from(map.entries()).map(([num, d]) => ({ number: num, name: d.name, templates: d.templates }));
	});

	function fullName(p: typeof patient) {
		return [p.paternalLastName, p.maternalLastName, p.firstName].filter(Boolean).join(' ');
	}
</script>

<svelte:head>
	<title>Nuevo Formulario — {fullName(patient)}</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/patients">Pacientes</a>
		<span>›</span>
		<a href="/patients/{patient.id}">{fullName(patient)}</a>
		<span>›</span>
		<span>Nuevo Formulario</span>
	</nav>

	<h1 class="page-title">Seleccionar Formulario</h1>
	<p class="subtitle">Para: <strong>{fullName(patient)}</strong></p>

	{#if templates.length === 0}
		<div class="empty-state">
			<p>No hay plantillas de formulario disponibles en el sistema.</p>
		</div>
	{:else}
		<form method="POST" use:enhance>
			{#each phases() as phase}
				<section class="phase-section">
					<div class="phase-title">FASE {phase.number}: {phase.name}</div>
					<div class="template-grid">
						{#each phase.templates as tpl}
							<label class="template-card">
								<input
									type="radio"
									name="templateId"
									value={tpl.id}
									class="radio-input"
								/>
								<div class="card-content">
									<span class="form-code">{tpl.code}</span>
									<h3>{tpl.name}</h3>
									{#if tpl.description}
										<p>{tpl.description}</p>
									{/if}
									{#if tpl.pageCount > 1}
										<span class="badge">{tpl.pageCount} págs.</span>
									{/if}
								</div>
								<div class="card-check">✓</div>
							</label>
						{/each}
					</div>
				</section>
			{/each}

			<div class="form-actions">
				<a href="/patients/{patient.id}" class="btn btn-ghost">Cancelar</a>
				<button type="submit" class="btn btn-primary">Crear Formulario</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 24px;
	}

	.breadcrumb {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 13px;
		color: #888;
		margin-bottom: 16px;
	}

	.breadcrumb a {
		color: #1F4E79;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.page-title {
		font-size: 22px;
		color: #1F4E79;
		margin: 0 0 4px;
	}

	.subtitle {
		font-size: 14px;
		color: #555;
		margin: 0 0 24px;
	}

	.phase-section {
		margin-bottom: 28px;
	}

	.phase-title {
		background-color: #1F4E79;
		color: white;
		padding: 8px 14px;
		font-size: 13px;
		font-weight: bold;
		border-radius: 4px;
		margin-bottom: 12px;
	}

	.template-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 10px;
	}

	.template-card {
		display: flex;
		align-items: flex-start;
		gap: 0;
		border: 2px solid #ddd;
		border-radius: 6px;
		padding: 14px 16px;
		cursor: pointer;
		background: white;
		transition: border-color 0.15s, box-shadow 0.15s;
		position: relative;
	}

	.template-card:hover {
		border-color: #1F4E79;
		box-shadow: 0 1px 6px rgba(31, 78, 121, 0.12);
	}

	.radio-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.radio-input:checked ~ .card-check {
		display: flex;
	}

	.template-card:has(.radio-input:checked) {
		border-color: #1F4E79;
		background-color: #EEF4FB;
	}

	.card-content {
		flex: 1;
	}

	.card-check {
		display: none;
		width: 22px;
		height: 22px;
		background: #1F4E79;
		color: white;
		border-radius: 50%;
		font-size: 12px;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.form-code {
		font-family: monospace;
		font-size: 11px;
		color: #999;
		display: block;
		margin-bottom: 2px;
	}

	.card-content h3 {
		margin: 0 0 4px;
		font-size: 14px;
		color: #1F4E79;
		line-height: 1.3;
	}

	.card-content p {
		margin: 0;
		font-size: 12px;
		color: #666;
	}

	.badge {
		display: inline-block;
		margin-top: 6px;
		font-size: 10px;
		background: #f0f0f0;
		border: 1px solid #ddd;
		border-radius: 3px;
		padding: 1px 5px;
		color: #555;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding-top: 12px;
		border-top: 1px solid #eee;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: #666;
		border: 1px dashed #ddd;
		border-radius: 6px;
	}

	.btn {
		display: inline-block;
		padding: 9px 20px;
		border-radius: 4px;
		font-size: 14px;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: background-color 0.15s;
	}

	.btn-primary {
		background-color: #1F4E79;
		color: white;
	}

	.btn-primary:hover {
		background-color: #1565C0;
	}

	.btn-ghost {
		background: transparent;
		color: #555;
		border: 1px solid #ccc;
	}

	.btn-ghost:hover {
		background-color: #f5f5f5;
	}
</style>
