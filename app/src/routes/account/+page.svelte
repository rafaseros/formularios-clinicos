<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Mi Cuenta — Gilead Bolivia</title>
</svelte:head>

<div class="page-container">
	<div class="form-card">
		<h1>Mi Cuenta</h1>

		<div class="info-row">
			<span class="label">Usuario:</span>
			<span class="value">{data.username}</span>
		</div>
		<div class="info-row">
			<span class="label">Nombre:</span>
			<span class="value">{data.displayName || '—'}</span>
		</div>

		<hr />

		<h2>Cambiar Contraseña</h2>

		{#if form?.error}
			<div class="error-box">{form.error}</div>
		{/if}

		{#if form?.success}
			<div class="success-box">Contraseña actualizada correctamente.</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="field">
				<label for="currentPassword">Contraseña actual</label>
				<input
					id="currentPassword"
					name="currentPassword"
					type="password"
					autocomplete="current-password"
					required
				/>
			</div>

			<div class="field">
				<label for="newPassword">Nueva contraseña <span class="optional">(mínimo 4 caracteres)</span></label>
				<input
					id="newPassword"
					name="newPassword"
					type="password"
					autocomplete="new-password"
					required
				/>
			</div>

			<div class="field">
				<label for="confirmPassword">Confirmar nueva contraseña</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					autocomplete="new-password"
					required
				/>
			</div>

			<button type="submit" class="btn-primary">Cambiar Contraseña</button>
		</form>
	</div>
</div>

<style>
	.page-container {
		max-width: 480px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.form-card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		padding: 32px;
	}

	h1 {
		color: #1F4E79;
		font-size: 20px;
		margin: 0 0 20px;
	}

	h2 {
		color: #333;
		font-size: 16px;
		margin: 0 0 16px;
	}

	hr {
		border: none;
		border-top: 1px solid #eee;
		margin: 20px 0;
	}

	.info-row {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.info-row .label {
		color: #888;
		min-width: 80px;
	}

	.info-row .value {
		color: #333;
		font-weight: 500;
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

	.success-box {
		background: #E8F5E9;
		border-left: 4px solid #4CAF50;
		color: #1B5E20;
		font-size: 14px;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.field {
		margin-bottom: 18px;
	}

	.field label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: #444;
		margin-bottom: 6px;
	}

	.optional {
		font-weight: 400;
		color: #999;
		font-size: 12px;
	}

	.field input {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 9px 12px;
		font-size: 14px;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}

	.field input:focus {
		outline: none;
		border-color: #1F4E79;
		box-shadow: 0 0 0 2px rgba(31, 78, 121, 0.15);
	}

	.btn-primary {
		width: 100%;
		background: #1F4E79;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 10px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.btn-primary:hover {
		background: #1565C0;
	}
</style>
