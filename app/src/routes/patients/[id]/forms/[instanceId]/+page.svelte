<script lang="ts">
	import { enhance } from '$app/forms';
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';

	let { data } = $props();

	const patient = $derived(data.patient);
	const instance = $derived(data.instance);
	const pageConfig = $derived(instance.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});

	const statusLabel: Record<string, string> = {
		draft: 'Borrador',
		completed: 'Completado',
		archived: 'Archivado'
	};

	const statusClass: Record<string, string> = {
		draft: 'status-draft',
		completed: 'status-completed',
		archived: 'status-archived'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('es-BO', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function fullName(p: typeof patient) {
		return [p.paternalLastName, p.maternalLastName, p.firstName].filter(Boolean).join(' ');
	}
</script>

<svelte:head>
	<title>{instance.templateCode} — {fullName(patient)}</title>
</svelte:head>

<div class="page-shell">
	<header class="viewer-header">
		<div class="header-left">
			<a href="/patients/{patient.id}" class="back-link">← {fullName(patient)}</a>
			<div class="form-info">
				<span class="form-code">{instance.templateCode}</span>
				<h1>{instance.templateName}</h1>
				{#if instance.templateDescription}
					<p>{instance.templateDescription}</p>
				{/if}
			</div>
		</div>

		<div class="header-right">
			<div class="instance-meta">
				<span class="status-badge {statusClass[instance.status]}">
					{statusLabel[instance.status]}
				</span>
				<span class="meta-date">
					Creado: {formatDate(instance.createdAt)}
				</span>
				{#if instance.updatedAt !== instance.createdAt}
					<span class="meta-date">
						Actualizado: {formatDate(instance.updatedAt)}
					</span>
				{/if}
			</div>

			<div class="header-actions">
				{#if instance.status === 'draft'}
					<form method="POST" action="?/complete" use:enhance>
						<button type="submit" class="btn btn-success">Marcar Completado</button>
					</form>
				{/if}
				{#if instance.status === 'completed'}
					<form method="POST" action="?/archive" use:enhance>
						<button type="submit" class="btn btn-muted">Archivar</button>
					</form>
				{/if}
				<a
					href="/api/forms/{instance.templateId}/pdf"
					target="_blank"
					rel="noopener"
					class="btn btn-pdf"
				>
					Descargar PDF
				</a>
				<a
					href="/forms/{instance.templateId}/print"
					target="_blank"
					rel="noopener"
					class="btn btn-print"
				>
					Imprimir / PDF
				</a>
			</div>
		</div>
	</header>

	<div class="patient-bar">
		<span class="patient-label">Paciente:</span>
		<strong>{fullName(patient)}</strong>
		<span class="sep">·</span>
		<span class="patient-ci">
			C.I. {patient.docNumber}{patient.docExtension ? ' ' + patient.docExtension : ''}
		</span>
	</div>

	<div class="viewer-body">
		<LetterVisualizer
			formId={instance.templateId}
			orientation={pageConfig.orientation}
		/>
	</div>
</div>

<style>
	.page-shell {
		min-height: 100vh;
		background-color: #e8e8e8;
		display: flex;
		flex-direction: column;
	}

	.viewer-header {
		background: white;
		border-bottom: 1px solid #ddd;
		padding: 10px 20px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-shrink: 0;
		gap: 16px;
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 16px;
	}

	.back-link {
		color: #1F4E79;
		text-decoration: none;
		font-size: 13px;
		white-space: nowrap;
		padding-top: 4px;
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
		font-size: 11px;
		color: #999;
		display: block;
		margin-bottom: 1px;
	}

	.form-info h1 {
		font-size: 15px;
		margin: 0 0 2px;
		color: #1F4E79;
	}

	.form-info p {
		font-size: 12px;
		color: #888;
		margin: 0;
	}

	.header-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	.instance-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.status-badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 600;
	}

	.status-draft { background: #FFF9C4; color: #827717; }
	.status-completed { background: #E8F5E9; color: #2E7D32; }
	.status-archived { background: #EEEEEE; color: #616161; }

	.meta-date {
		font-size: 11px;
		color: #999;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.patient-bar {
		background: #f5f5f5;
		border-bottom: 1px solid #e0e0e0;
		padding: 6px 20px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: #444;
		flex-shrink: 0;
	}

	.patient-label {
		color: #888;
	}

	.sep {
		color: #bbb;
	}

	.patient-ci {
		font-family: monospace;
		font-size: 12px;
		color: #666;
	}

	.viewer-body {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		overflow: auto;
	}

	.btn {
		display: inline-block;
		padding: 7px 14px;
		border-radius: 4px;
		font-size: 13px;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: background-color 0.15s;
		white-space: nowrap;
	}

	.btn-pdf {
		background-color: #2E7D32;
		color: white;
	}

	.btn-pdf:hover {
		background-color: #1B5E20;
	}

	.btn-print {
		background-color: #1F4E79;
		color: white;
	}

	.btn-print:hover {
		background-color: #1565C0;
	}

	.btn-success {
		background-color: #2E7D32;
		color: white;
	}

	.btn-success:hover {
		background-color: #1B5E20;
	}

	.btn-muted {
		background-color: #757575;
		color: white;
	}

	.btn-muted:hover {
		background-color: #616161;
	}
</style>
