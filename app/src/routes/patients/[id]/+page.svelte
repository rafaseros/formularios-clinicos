<script lang="ts">
	let { data } = $props();

	const patient = $derived(data.patient);
	const instances = $derived(data.instances);

	const statusLabel: Record<string, string> = {
		active: 'Activo',
		discharged: 'Alta',
		transferred: 'Transferido'
	};

	const instanceStatusLabel: Record<string, string> = {
		draft: 'Borrador',
		completed: 'Completado',
		archived: 'Archivado'
	};

	const instanceStatusClass: Record<string, string> = {
		draft: 'status-draft',
		completed: 'status-completed',
		archived: 'status-archived'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('es-BO', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function fullName(p: typeof patient) {
		return [p.paternalLastName, p.maternalLastName, p.firstName].filter(Boolean).join(' ');
	}
</script>

<svelte:head>
	<title>{fullName(patient)} — Gilead Bolivia</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/patients">Pacientes</a>
		<span>›</span>
		<span>{fullName(patient)}</span>
	</nav>

	<header class="page-header">
		<div class="header-left">
			<h1>{fullName(patient)}</h1>
			<div class="patient-meta">
				<span class="ci">C.I.: {patient.docNumber}{patient.docExtension ? ' ' + patient.docExtension : ''}</span>
				{#if patient.clinicalRecordNumber}
					<span class="sep">·</span>
					<span>Exp.: {patient.clinicalRecordNumber}</span>
				{/if}
				<span class="sep">·</span>
				<span class="status-pill status-{patient.status}">{statusLabel[patient.status]}</span>
			</div>
		</div>
		<a href="/patients/{patient.id}/edit" class="btn btn-secondary">Editar Datos</a>
	</header>

	<div class="info-grid">
		<div class="info-card">
			<h2>Datos Personales</h2>
			<dl>
				<div class="dl-row">
					<dt>Nombre(s)</dt>
					<dd>{patient.firstName || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Apellido Paterno</dt>
					<dd>{patient.paternalLastName || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Apellido Materno</dt>
					<dd>{patient.maternalLastName || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Fecha Nacimiento</dt>
					<dd>{patient.birthDate ? formatDate(patient.birthDate) : '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Sexo</dt>
					<dd>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : '—'}</dd>
				</div>
			</dl>
		</div>

		<div class="info-card">
			<h2>Contacto</h2>
			<dl>
				<div class="dl-row">
					<dt>Teléfono</dt>
					<dd>{patient.phone || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Ciudad</dt>
					<dd>{patient.city || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Dirección</dt>
					<dd>{patient.address || '—'}</dd>
				</div>
				<div class="dl-row">
					<dt>Registrado</dt>
					<dd>{formatDate(patient.createdAt)}</dd>
				</div>
			</dl>
		</div>
	</div>

	<section class="instances-section">
		<div class="section-header">
			<h2>Formularios del Paciente</h2>
			<a href="/patients/{patient.id}/forms/new" class="btn btn-primary">+ Nuevo Formulario</a>
		</div>

		{#if instances.length === 0}
			<div class="empty-state">
				<p>Este paciente no tiene formularios registrados aún.</p>
				<a href="/patients/{patient.id}/forms/new" class="btn btn-primary">Crear primer formulario</a>
			</div>
		{:else}
			<div class="instances-table-wrapper">
				<table class="instances-table">
					<thead>
						<tr>
							<th>Código</th>
							<th>Formulario</th>
							<th>Estado</th>
							<th>Fecha</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#each instances as inst}
							<tr>
								<td class="code-cell">{inst.templateCode}</td>
								<td>{inst.templateName}</td>
								<td>
									<span class="status-badge {instanceStatusClass[inst.status]}">
										{instanceStatusLabel[inst.status]}
									</span>
								</td>
								<td class="date-cell">{formatDate(inst.createdAt)}</td>
								<td class="actions">
									<a href="/patients/{patient.id}/forms/{inst.id}" class="action-link">Ver</a>
									<a
										href="/forms/{inst.templateId}/print"
										target="_blank"
										rel="noopener"
										class="action-link"
									>
										Imprimir
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
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

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 2px solid #1F4E79;
	}

	.page-header h1 {
		font-size: 22px;
		color: #1F4E79;
		margin: 0 0 6px;
	}

	.patient-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: #555;
		flex-wrap: wrap;
	}

	.ci {
		font-family: monospace;
	}

	.sep {
		color: #bbb;
	}

	.status-pill {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 500;
	}

	.status-active { background: #E8F5E9; color: #2E7D32; }
	.status-discharged { background: #FFF3E0; color: #E65100; }
	.status-transferred { background: #E3F2FD; color: #1565C0; }

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 32px;
	}

	@media (max-width: 640px) {
		.info-grid { grid-template-columns: 1fr; }
	}

	.info-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 6px;
		padding: 16px 20px;
	}

	.info-card h2 {
		font-size: 13px;
		font-weight: 600;
		color: #1F4E79;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid #eee;
	}

	dl {
		margin: 0;
	}

	.dl-row {
		display: flex;
		gap: 12px;
		padding: 5px 0;
		border-bottom: 1px solid #f5f5f5;
		font-size: 14px;
	}

	.dl-row:last-child {
		border-bottom: none;
	}

	dt {
		flex: 0 0 140px;
		color: #666;
		font-size: 13px;
	}

	dd {
		margin: 0;
		color: #222;
		font-weight: 500;
	}

	.instances-section {
		margin-top: 8px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-header h2 {
		font-size: 18px;
		color: #1F4E79;
		margin: 0;
	}

	.instances-table-wrapper {
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow-x: auto;
	}

	.instances-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.instances-table th {
		background: #f5f5f5;
		padding: 10px 14px;
		text-align: left;
		font-weight: 600;
		color: #444;
		border-bottom: 1px solid #ddd;
	}

	.instances-table td {
		padding: 10px 14px;
		border-bottom: 1px solid #f0f0f0;
		vertical-align: middle;
	}

	.instances-table tbody tr:last-child td {
		border-bottom: none;
	}

	.instances-table tbody tr:hover td {
		background: #f9f9f9;
	}

	.code-cell {
		font-family: monospace;
		font-size: 12px;
		color: #888;
	}

	.date-cell {
		font-size: 13px;
		color: #666;
		white-space: nowrap;
	}

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 500;
	}

	.status-draft { background: #FFF9C4; color: #827717; }
	.status-completed { background: #E8F5E9; color: #2E7D32; }
	.status-archived { background: #EEEEEE; color: #616161; }

	.actions {
		display: flex;
		gap: 12px;
	}

	.action-link {
		color: #1F4E79;
		text-decoration: none;
		font-size: 13px;
	}

	.action-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		border: 1px dashed #ddd;
		border-radius: 6px;
		color: #666;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.btn {
		display: inline-block;
		padding: 8px 16px;
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

	.btn-secondary {
		background-color: #e0e0e0;
		color: #333;
	}

	.btn-secondary:hover {
		background-color: #bdbdbd;
	}
</style>
