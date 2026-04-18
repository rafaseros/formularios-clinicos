<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Mi Cuenta — Gilead Bolivia</title>
</svelte:head>

<div class="page-container">
	<div class="form-card">
		<div class="card-header">
			<div class="avatar">{(data.displayName || data.username || '?')[0].toUpperCase()}</div>
			<div>
				<h1>Mi Cuenta</h1>
				<p class="account-subtitle">Configuración de perfil</p>
			</div>
		</div>

		<div class="info-section">
			<div class="info-row">
				<span class="label">Usuario</span>
				<span class="value mono">{data.username}</span>
			</div>
			<div class="info-row">
				<span class="label">Nombre</span>
				<span class="value">{data.displayName || '—'}</span>
			</div>
		</div>

		<div class="section-divider">
			<span>Cambiar Contraseña</span>
		</div>

		{#if form?.error}
			<div class="error-box" role="alert">{form.error}</div>
		{/if}

		{#if form?.success}
			<div class="success-box" role="status">Contraseña actualizada correctamente.</div>
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
				<label for="newPassword"
					>Nueva contraseña <span class="optional">mínimo 4 caracteres</span></label
				>
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
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--color-border);
		padding: 32px;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 24px;
	}

	.avatar {
		width: 44px;
		height: 44px;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: 700;
		flex-shrink: 0;
	}

	h1 {
		color: var(--color-primary);
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 2px;
	}

	.account-subtitle {
		color: var(--color-text-muted);
		font-size: 13px;
		margin: 0;
	}

	/* ─── Info section ────────────────────────────────── */
	.info-section {
		background: var(--color-bg);
		border-radius: var(--radius-md);
		padding: 16px;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.label {
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.value {
		color: var(--color-text);
		font-weight: 500;
	}

	.mono {
		font-family: var(--font-mono);
		font-size: 12px;
	}

	/* ─── Section divider ─────────────────────────────── */
	.section-divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
		color: var(--color-text-muted);
		font-size: 13px;
		font-weight: 600;
	}

	.section-divider::before,
	.section-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}

	/* ─── Feedback boxes ──────────────────────────────── */
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

	/* ─── Form fields ─────────────────────────────────── */
	.field {
		margin-bottom: 16px;
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

	.optional {
		font-weight: 400;
		color: var(--color-text-subtle);
		font-size: 11px;
		text-transform: none;
		letter-spacing: 0;
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

	@media (max-width: 768px) {
		.page-container {
			padding: 20px 16px;
		}

		.form-card {
			padding: 24px 18px;
		}
	}
</style>
