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
			<div class="auth-logo">GB</div>
			<h1>Gilead Bolivia</h1>
			<p>Iniciá sesión para continuar</p>
		</div>

		{#if form?.error}
			<div class="error-box" role="alert">{form.error}</div>
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

		<p class="auth-footer">Contactá al administrador para obtener una cuenta.</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: calc(100vh - 52px);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
		padding: 24px 16px;
	}

	.auth-card {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--color-border);
		padding: 40px 36px;
		width: 100%;
		max-width: 380px;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 28px;
	}

	.auth-logo {
		width: 48px;
		height: 48px;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
		letter-spacing: 1px;
		margin: 0 auto 14px;
	}

	.auth-header h1 {
		color: var(--color-primary);
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 6px;
		letter-spacing: -0.2px;
	}

	.auth-header p {
		color: var(--color-text-muted);
		font-size: 14px;
		margin: 0;
	}

	.error-box {
		background: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-left-width: 3px;
		color: var(--color-error-text);
		font-size: 13px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 20px;
	}

	.field {
		margin-bottom: 18px;
	}

	.field label {
		display: block;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
	}

	.field input {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-size: 14px;
		font-family: var(--font-system);
		box-sizing: border-box;
		transition: var(--transition);
		background: var(--color-bg);
		color: var(--color-text);
	}

	.field input:focus {
		outline: none;
		border-color: var(--color-primary);
		background: var(--color-surface);
		box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.1);
	}

	.field input::placeholder {
		color: var(--color-text-subtle);
	}

	.btn-primary {
		width: 100%;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		padding: 11px;
		font-size: 14px;
		font-weight: 600;
		font-family: var(--font-system);
		cursor: pointer;
		transition: var(--transition);
		margin-top: 4px;
	}

	.btn-primary:hover {
		background: var(--color-primary-light);
	}

	.btn-primary:active {
		background: var(--color-primary-dark);
	}

	.auth-footer {
		text-align: center;
		font-size: 12px;
		color: var(--color-text-subtle);
		margin-top: 20px;
		margin-bottom: 0;
	}

	@media (max-width: 768px) {
		.auth-card {
			padding: 28px 20px;
		}
	}
</style>
