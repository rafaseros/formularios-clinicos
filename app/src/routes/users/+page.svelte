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
		max-width: 900px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h1 {
		color: #1F4E79;
		font-size: 22px;
		margin: 0;
	}

	.btn-primary {
		background: #1F4E79;
		color: white;
		text-decoration: none;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		transition: background-color 0.15s;
	}

	.btn-primary:hover {
		background: #1565C0;
	}

	.success-box {
		background: #E8F5E9;
		border-left: 4px solid #4CAF50;
		color: #1B5E20;
		font-size: 14px;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.error-box {
		background: #FFEBEE;
		border-left: 4px solid #E53935;
		color: #B71C1C;
		font-size: 14px;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.table-wrapper {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		background: #f8f9fa;
		padding: 10px 16px;
		text-align: left;
		font-size: 12px;
		font-weight: 600;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-bottom: 1px solid #eee;
	}

	td {
		padding: 12px 16px;
		font-size: 14px;
		border-bottom: 1px solid #f0f0f0;
		color: #333;
	}

	.username {
		font-family: monospace;
		font-weight: 600;
	}

	.date {
		color: #888;
		font-size: 13px;
	}

	.badge {
		font-size: 11px;
		padding: 3px 8px;
		border-radius: 3px;
		background: #e8e8e8;
		color: #555;
	}

	.badge-admin {
		background: #E3F2FD;
		color: #1565C0;
	}

	.actions {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.btn-action {
		background: none;
		border: 1px solid #ccc;
		color: #555;
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.btn-action:hover {
		border-color: #1F4E79;
		color: #1F4E79;
	}

	.btn-reset:hover {
		border-color: #E53935;
		color: #E53935;
	}

	.edit-form {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.edit-input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 13px;
		width: 160px;
	}

	.edit-input:focus {
		outline: none;
		border-color: #1F4E79;
	}

	.btn-save {
		background: #1F4E79;
		color: white;
		border: none;
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.btn-save:hover {
		background: #1565C0;
	}

	.btn-cancel {
		background: none;
		border: 1px solid #ccc;
		color: #666;
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.btn-cancel:hover {
		border-color: #999;
	}
</style>
