<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form: actionForm } = $props();
	const users = $derived(data.users);

	let editingId = $state<number | null>(null);
	let editName = $state('');

	function startEdit(user: { id: number; displayName: string }) {
		editingId = user.id;
		editName = user.displayName;
	}

	function cancelEdit() {
		editingId = null;
		editName = '';
	}
</script>

<svelte:head>
	<title>Usuarios — Gilead Bolivia</title>
</svelte:head>

<div class="page-container">
	<div class="page-header">
		<h1>Usuarios</h1>
		<a href="/register" class="btn-primary">+ Nuevo Usuario</a>
	</div>

	{#if actionForm?.message}
		<div class="success-box">{actionForm.message}</div>
	{/if}
	{#if actionForm?.error}
		<div class="error-box">{actionForm.error}</div>
	{/if}

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>Usuario</th>
					<th>Nombre</th>
					<th>Rol</th>
					<th>Imprimir</th>
					<th>Registrado</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr>
						<td class="username">{user.username}</td>
						<td>
							{#if editingId === user.id}
								<form
									method="POST"
									action="?/updateName"
									use:enhance={() => {
										return ({ update }) => {
											editingId = null;
											update();
										};
									}}
									class="edit-form"
								>
									<input type="hidden" name="userId" value={user.id} />
									<input
										type="text"
										name="displayName"
										bind:value={editName}
										class="edit-input"
										required
									/>
									<button type="submit" class="btn-save">Guardar</button>
									<button type="button" class="btn-cancel" onclick={cancelEdit}>Cancelar</button>
								</form>
							{:else}
								{user.displayName || '—'}
							{/if}
						</td>
						<td>
							<span class="badge" class:badge-admin={user.role === 'admin'}>
								{user.role === 'admin' ? 'Administrador' : 'Usuario'}
							</span>
						</td>
						<td>
							<form
								method="POST"
								action="?/togglePrint"
								use:enhance={() => {
									return ({ update }) => {
										update();
									};
								}}
								style="display:inline"
							>
								<input type="hidden" name="userId" value={user.id} />
								<button
									type="submit"
									class="badge-print-btn"
									class:badge-print-on={user.canPrint}
									class:badge-print-off={!user.canPrint}
								>
									{user.canPrint ? 'Habilitado' : 'Deshabilitado'}
								</button>
							</form>
						</td>
						<td class="date">{new Date(user.createdAt).toLocaleDateString('es-BO')}</td>
						<td class="actions">
							{#if editingId !== user.id}
								<button class="btn-action" onclick={() => startEdit(user)}>Editar</button>
								<form
									method="POST"
									action="?/resetPassword"
									use:enhance={() => {
										return ({ update }) => {
											update();
										};
									}}
									style="display:inline"
								>
									<input type="hidden" name="userId" value={user.id} />
									<button type="submit" class="btn-action btn-reset">Resetear clave</button>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	h1 {
		color: var(--color-primary);
		font-size: 22px;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.2px;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
		text-decoration: none;
		padding: 9px 16px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		transition: var(--transition);
		white-space: nowrap;
	}

	.btn-primary:hover {
		background: var(--color-primary-light);
	}

	.success-box {
		background: var(--color-success-bg);
		border: 1px solid var(--color-success-border);
		border-left-width: 3px;
		color: var(--color-success-text);
		font-size: 13px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 16px;
	}

	.error-box {
		background: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-left-width: 3px;
		color: var(--color-error-text);
		font-size: 13px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 16px;
	}

	.table-wrapper {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--color-border);
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 580px;
	}

	th {
		background: var(--color-bg);
		padding: 11px 16px;
		text-align: left;
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.6px;
		border-bottom: 1px solid var(--color-border);
		white-space: nowrap;
	}

	td {
		padding: 13px 16px;
		font-size: 13px;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
		vertical-align: middle;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover td {
		background: var(--color-bg);
	}

	.username {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 12px;
	}

	.date {
		color: var(--color-text-subtle);
		font-size: 12px;
	}

	.badge {
		font-size: 11px;
		font-weight: 600;
		padding: 3px 9px;
		border-radius: 20px;
		background: var(--color-bg);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.badge-admin {
		background: var(--color-info-bg);
		color: var(--color-info-text);
		border-color: var(--color-info-border);
	}

	.actions {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.btn-action {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 12px;
		font-family: var(--font-system);
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
		white-space: nowrap;
	}

	.btn-action:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-info-bg);
	}

	.btn-reset:hover {
		border-color: var(--color-error-border);
		color: var(--color-error-text);
		background: var(--color-error-bg);
	}

	.edit-form {
		display: flex;
		gap: 6px;
		align-items: center;
		flex-wrap: wrap;
	}

	.edit-input {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 5px 9px;
		font-size: 13px;
		font-family: var(--font-system);
		width: 150px;
		transition: var(--transition);
		background: var(--color-bg);
	}

	.edit-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(31, 78, 121, 0.1);
		background: var(--color-surface);
	}

	.btn-save {
		background: var(--color-primary);
		color: white;
		border: none;
		font-size: 12px;
		font-family: var(--font-system);
		font-weight: 600;
		padding: 5px 11px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-save:hover {
		background: var(--color-primary-light);
	}

	.btn-cancel {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 12px;
		font-family: var(--font-system);
		padding: 5px 11px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-cancel:hover {
		border-color: var(--color-text-subtle);
		color: var(--color-text);
	}

	.badge-print-btn {
		font-size: 11px;
		font-weight: 600;
		font-family: var(--font-system);
		padding: 3px 9px;
		border-radius: 20px;
		border: 1px solid;
		cursor: pointer;
		transition: var(--transition);
	}

	.badge-print-on {
		background: var(--color-success-bg);
		color: var(--color-success-text);
		border-color: var(--color-success-border);
	}

	.badge-print-on:hover {
		opacity: 0.8;
	}

	.badge-print-off {
		background: var(--color-bg);
		color: var(--color-text-muted);
		border-color: var(--color-border);
	}

	.badge-print-off:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 20px 16px;
		}

		.table-wrapper {
			border-radius: var(--radius-sm);
		}
	}
</style>
