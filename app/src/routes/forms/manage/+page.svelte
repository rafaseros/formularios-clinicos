<script lang="ts">
	let { data } = $props();

	const forms = $derived(data.forms);

	type FormRow = (typeof forms)[number];

	let expandedCodes = $state<Set<string>>(new Set());
	let loadingCodes = $state<Set<string>>(new Set());
	let messages = $state<Record<string, string>>({});

	function toggleVersions(code: string) {
		const next = new Set(expandedCodes);
		if (next.has(code)) {
			next.delete(code);
		} else {
			next.add(code);
		}
		expandedCodes = next;
	}

	async function createVersion(form: FormRow) {
		const next = new Set(loadingCodes);
		next.add(form.code);
		loadingCodes = next;
		messages = { ...messages, [form.code]: '' };

		try {
			const res = await fetch(`/api/forms/${form.latestId}/versions`, {
				method: 'POST'
			});
			if (!res.ok) {
				const err = await res.text();
				messages = { ...messages, [form.code]: `Error: ${err}` };
				return;
			}
			const body = await res.json();
			messages = {
				...messages,
				[form.code]: `Versión ${body.version.version} creada (ID ${body.version.id})`
			};
			// Reload to reflect new version
			window.location.reload();
		} catch (e) {
			messages = { ...messages, [form.code]: 'Error de red' };
		} finally {
			const next2 = new Set(loadingCodes);
			next2.delete(form.code);
			loadingCodes = next2;
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('es-BO', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Gestión de Formularios</title>
</svelte:head>

<div class="manage-page">
	<header class="page-header">
		<div class="header-left">
			<a href="/" class="back-link">← Inicio</a>
			<h1>Gestión de Formularios</h1>
		</div>
		<span class="total-badge">{forms.length} formularios</span>
	</header>

	<div class="table-wrapper">
		<table class="forms-table">
			<thead>
				<tr>
					<th class="col-code">Código</th>
					<th class="col-name">Nombre</th>
					<th class="col-phase">Fase</th>
					<th class="col-version">Versión</th>
					<th class="col-date">Creado</th>
					<th class="col-actions">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each forms as form (form.code)}
					<tr class="form-row">
						<td class="col-code">
							<code>{form.code}</code>
						</td>
						<td class="col-name">
							<span class="form-name">{form.name}</span>
							{#if form.description}
								<span class="form-desc">{form.description}</span>
							{/if}
						</td>
						<td class="col-phase">
							{#if form.phaseName}
								<span class="phase-badge">F{form.phase} — {form.phaseName}</span>
							{:else}
								<span class="phase-badge">Fase {form.phase}</span>
							{/if}
						</td>
						<td class="col-version">
							<button
								class="version-toggle"
								onclick={() => toggleVersions(form.code)}
								title="Ver historial de versiones"
							>
								v{form.latestVersion}
								{#if form.versions.length > 1}
									<span class="version-count">({form.versions.length})</span>
								{/if}
								<span class="chevron" class:expanded={expandedCodes.has(form.code)}>▾</span>
							</button>
						</td>
						<td class="col-date">{formatDate(form.versions[0].createdAt)}</td>
						<td class="col-actions">
							<div class="actions">
								<a
									href="/forms/{form.latestId}"
									class="btn btn-view"
									title="Ver formulario"
								>
									Ver
								</a>
								<a
									href="/api/forms/{form.latestId}/pdf"
									target="_blank"
									class="btn btn-pdf"
									title="Descargar PDF"
								>
									PDF
								</a>
								<button
									class="btn btn-new-version"
									onclick={() => createVersion(form)}
									disabled={loadingCodes.has(form.code)}
									title="Crear nueva versión"
								>
									{loadingCodes.has(form.code) ? 'Creando…' : 'Nueva Versión'}
								</button>
							</div>
							{#if messages[form.code]}
								<p class="action-msg">{messages[form.code]}</p>
							{/if}
						</td>
					</tr>

					{#if expandedCodes.has(form.code) && form.versions.length > 1}
						{#each form.versions as v (v.id)}
							<tr class="version-row">
								<td></td>
								<td colspan="2" class="version-label">
									<span class="version-tag">v{v.version}</span>
									{formatDate(v.createdAt)}
								</td>
								<td class="col-version"></td>
								<td></td>
								<td class="col-actions">
									<div class="actions">
										<a href="/forms/{v.id}" class="btn btn-view btn-sm">Ver</a>
										<a
											href="/api/forms/{v.id}/pdf"
											target="_blank"
											class="btn btn-pdf btn-sm"
										>PDF</a>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.manage-page {
		min-height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
	}

	.page-header {
		background: white;
		border-bottom: 1px solid #ddd;
		padding: 14px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.back-link {
		color: #1F4E79;
		text-decoration: none;
		font-size: 14px;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	h1 {
		margin: 0;
		font-size: 20px;
		color: #1F4E79;
	}

	.total-badge {
		background: #E3F2FD;
		color: #1565C0;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 600;
	}

	.table-wrapper {
		padding: 24px;
		overflow-x: auto;
	}

	.forms-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0,0,0,0.08);
		font-size: 14px;
	}

	.forms-table thead {
		background: #1F4E79;
		color: white;
	}

	.forms-table th {
		padding: 12px 14px;
		text-align: left;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.forms-table td {
		padding: 12px 14px;
		border-bottom: 1px solid #f0f0f0;
		vertical-align: middle;
	}

	.form-row:hover td {
		background: #fafafa;
	}

	.form-row:last-child td {
		border-bottom: none;
	}

	.col-code {
		width: 100px;
	}

	.col-code code {
		font-family: monospace;
		font-size: 12px;
		color: #555;
		background: #f5f5f5;
		padding: 2px 6px;
		border-radius: 3px;
	}

	.form-name {
		display: block;
		font-weight: 500;
		color: #222;
	}

	.form-desc {
		display: block;
		font-size: 12px;
		color: #999;
		margin-top: 2px;
	}

	.phase-badge {
		font-size: 12px;
		color: #555;
		background: #EDE7F6;
		color: #4527A0;
		padding: 2px 8px;
		border-radius: 10px;
		white-space: nowrap;
	}

	.version-toggle {
		background: none;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 3px 8px;
		font-size: 13px;
		cursor: pointer;
		color: #1F4E79;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		transition: background 0.15s;
	}

	.version-toggle:hover {
		background: #E3F2FD;
	}

	.version-count {
		font-size: 11px;
		color: #888;
		font-weight: 400;
	}

	.chevron {
		font-size: 12px;
		transition: transform 0.2s;
		display: inline-block;
	}

	.chevron.expanded {
		transform: rotate(180deg);
	}

	.version-row td {
		background: #fafafa;
		border-bottom: 1px solid #f0f0f0;
	}

	.version-label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
		color: #888;
		padding-left: 24px;
	}

	.version-tag {
		font-family: monospace;
		font-size: 11px;
		background: #E8EAF6;
		color: #3949AB;
		padding: 1px 6px;
		border-radius: 3px;
	}

	.actions {
		display: flex;
		gap: 6px;
		align-items: center;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-block;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 13px;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: background-color 0.15s;
		white-space: nowrap;
	}

	.btn-sm {
		padding: 4px 8px;
		font-size: 12px;
	}

	.btn-view {
		background: #E3F2FD;
		color: #1565C0;
	}

	.btn-view:hover {
		background: #BBDEFB;
	}

	.btn-pdf {
		background: #E8F5E9;
		color: #2E7D32;
	}

	.btn-pdf:hover {
		background: #C8E6C9;
	}

	.btn-new-version {
		background: #FFF3E0;
		color: #E65100;
	}

	.btn-new-version:hover:not(:disabled) {
		background: #FFE0B2;
	}

	.btn-new-version:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-msg {
		font-size: 11px;
		color: #2E7D32;
		margin: 4px 0 0;
	}
</style>
