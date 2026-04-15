<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Iniciar Sesión — Gilead Bolivia</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Gilead Bolivia</h1>
			<p>Iniciar Sesión</p>
		</div>

		{#if form?.error}
			<div class="error-box">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

			<div class="field">
				<label for="username">Usuario</label>
				<input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					value={form?.username ?? ''}
					placeholder="nombre de usuario"
					required
				/>
			</div>

			<div class="field">
				<label for="password">Contraseña</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					placeholder="••••••••"
					required
				/>
			</div>

			<button type="submit" class="btn-primary">Iniciar Sesión</button>
		</form>

		<p class="auth-footer">
			¿No tenés cuenta? <a href="/register">Registrarse</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f4f8;
		padding: 24px;
	}

	.auth-card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
		padding: 40px;
		width: 100%;
		max-width: 380px;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 28px;
	}

	.auth-header h1 {
		color: #1F4E79;
		font-size: 22px;
		margin: 0 0 6px;
	}

	.auth-header p {
		color: #666;
		font-size: 15px;
		margin: 0;
	}

	.error-box {
		background: #FFEBEE;
		border-left: 4px solid #E53935;
		color: #B71C1C;
		font-size: 14px;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 20px;
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

	.auth-footer {
		text-align: center;
		font-size: 13px;
		color: #666;
		margin-top: 20px;
		margin-bottom: 0;
	}

	.auth-footer a {
		color: #1F4E79;
		text-decoration: none;
		font-weight: 600;
	}

	.auth-footer a:hover {
		text-decoration: underline;
	}
</style>
