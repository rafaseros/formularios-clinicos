<script lang="ts">
	let { data } = $props();
	const users = $derived(data.users);
</script>

<svelte:head>
	<title>Usuarios — Gilead Bolivia</title>
</svelte:head>

<div class="page-container">
	<div class="page-header">
		<h1>Usuarios</h1>
		<a href="/register" class="btn-primary">+ Nuevo Usuario</a>
	</div>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>Usuario</th>
					<th>Nombre</th>
					<th>Rol</th>
					<th>Registrado</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr>
						<td class="username">{user.username}</td>
						<td>{user.displayName || '—'}</td>
						<td>
							<span class="badge" class:badge-admin={user.role === 'admin'}>
								{user.role === 'admin' ? 'Administrador' : 'Usuario'}
							</span>
						</td>
						<td class="date">{new Date(user.createdAt).toLocaleDateString('es-BO')}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-container {
		max-width: 800px;
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
</style>
