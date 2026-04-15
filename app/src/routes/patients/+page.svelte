<script lang="ts">
	let { data } = $props();

	const statusLabel: Record<string, string> = {
		active: 'Activo',
		discharged: 'Alta',
		transferred: 'Transferido'
	};

	const statusClass: Record<string, string> = {
		active: 'status-active',
		discharged: 'status-discharged',
		transferred: 'status-transferred'
	};
</script>

<svelte:head>
	<title>Pacientes — Gilead Bolivia</title>
</svelte:head>

<div class="container">
	<header class="page-header">
		<div class="header-left">
			<h1>Pacientes</h1>
			<p class="subtitle">Gestión de pacientes del programa</p>
		</div>
		<a href="/patients/new" class="btn btn-primary">+ Nuevo Paciente</a>
	</header>

	<div class="search-bar">
		<form method="GET" action="/patients">
			<input
				type="text"
				name="q"
				value={data.search}
				placeholder="Buscar por nombre o C.I. ..."
				class="search-input"
			/>
			<button type="submit" class="btn btn-secondary">Buscar</button>
			{#if data.search}
				<a href="/patients" class="btn btn-ghost">Limpiar</a>
			{/if}
		</form>
	</div>

	{#if data.patients.length === 0}
		<div class="empty-state">
			{#if data.search}
				<p>No se encontraron pacientes para <strong>"{data.search}"</strong>.</p>
			{:else}
				<p>No hay pacientes registrados aún.</p>
			{/if}
			<a href="/patients/new" class="btn btn-primary">Registrar primer paciente</a>
		</div>
	{:else}
		<div class="table-count">
			{data.patients.length} paciente{data.patients.length !== 1 ? 's' : ''}
			{data.search ? `encontrado${data.patients.length !== 1 ? 's' : ''}` : ''}
		</div>
		<div class="table-wrapper">
			<table class="patients-table">
				<thead>
					<tr>
						<th>Nombre Completo</th>
						<th>C.I.</th>
						<th>Nro. Expediente</th>
						<th>Teléfono</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each data.patients as patient}
						<tr>
							<td class="patient-name">
								{patient.paternalLastName}
								{patient.maternalLastName}
								{patient.firstName}
							</td>
							<td class="doc-number">
								{patient.docNumber}{patient.docExtension ? ' ' + patient.docExtension : ''}
							</td>
							<td>{patient.clinicalRecordNumber ?? '—'}</td>
							<td>{patient.phone || '—'}</td>
							<td>
								<span class="status-badge {statusClass[patient.status]}">
									{statusLabel[patient.status]}
								</span>
							</td>
							<td class="actions">
								<a href="/patients/{patient.id}" class="action-link">Ver</a>
								<a href="/patients/{patient.id}/edit" class="action-link">Editar</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 2px solid #1F4E79;
	}

	.header-left h1 {
		margin: 0;
		font-size: 24px;
		color: #1F4E79;
	}

	.subtitle {
		margin: 4px 0 0;
		font-size: 13px;
		color: #666;
	}

	.search-bar {
		margin-bottom: 20px;
	}

	.search-bar form {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.search-input {
		flex: 1;
		max-width: 380px;
		padding: 8px 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
	}

	.search-input:focus {
		outline: none;
		border-color: #1F4E79;
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

	.btn-ghost {
		background: transparent;
		color: #1F4E79;
		text-decoration: underline;
	}

	.table-count {
		font-size: 13px;
		color: #666;
		margin-bottom: 8px;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.patients-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.patients-table th {
		background-color: #f5f5f5;
		padding: 10px 14px;
		text-align: left;
		font-weight: 600;
		color: #444;
		border-bottom: 1px solid #ddd;
		white-space: nowrap;
	}

	.patients-table td {
		padding: 10px 14px;
		border-bottom: 1px solid #f0f0f0;
		vertical-align: middle;
	}

	.patients-table tbody tr:last-child td {
		border-bottom: none;
	}

	.patients-table tbody tr:hover td {
		background-color: #f9f9f9;
	}

	.patient-name {
		font-weight: 500;
		color: #222;
	}

	.doc-number {
		font-family: monospace;
		font-size: 13px;
	}

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 500;
	}

	.status-active {
		background-color: #E8F5E9;
		color: #2E7D32;
	}

	.status-discharged {
		background-color: #FFF3E0;
		color: #E65100;
	}

	.status-transferred {
		background-color: #E3F2FD;
		color: #1565C0;
	}

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
		padding: 48px 24px;
		color: #666;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.empty-state p {
		font-size: 15px;
		margin: 0;
	}
</style>
