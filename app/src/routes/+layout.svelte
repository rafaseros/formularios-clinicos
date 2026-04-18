<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
	const user = $derived(data.user);

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="global-nav">
	<div class="nav-inner">
		<a href="/" class="nav-brand" onclick={closeMenu}>Gilead Bolivia</a>

		<!-- Desktop links -->
		<div class="nav-links">
			<a href="/" class="nav-link">Formularios</a>
			{#if user?.role === 'admin'}
				<a href="/users" class="nav-link">Usuarios</a>
				<a href="/forms/manage" class="nav-link">Gestión</a>
			{/if}
		</div>

		<!-- Desktop auth -->
		<div class="nav-auth desktop-auth">
			{#if user}
				<a href="/account" class="nav-link nav-account">{user.displayName || user.username}</a>
				<form method="POST" action="/logout" style="display:inline">
					<button type="submit" class="btn-logout">Cerrar Sesión</button>
				</form>
			{:else}
				<a href="/login" class="nav-link">Iniciar Sesión</a>
			{/if}
		</div>

		<!-- Hamburger button (mobile only) -->
		<button
			class="hamburger"
			aria-label="Abrir menú"
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
			<span class="bar"></span>
			<span class="bar"></span>
			<span class="bar"></span>
		</button>
	</div>

	<!-- Mobile dropdown -->
	{#if menuOpen}
		<div class="mobile-menu">
			<a href="/" class="mobile-link" onclick={closeMenu}>Formularios</a>
			{#if user?.role === 'admin'}
				<a href="/users" class="mobile-link" onclick={closeMenu}>Usuarios</a>
				<a href="/forms/manage" class="mobile-link" onclick={closeMenu}>Gestión</a>
			{/if}
			<div class="mobile-divider"></div>
			{#if user}
				<a href="/account" class="mobile-link" onclick={closeMenu}
					>{user.displayName || user.username}</a
				>
				<form method="POST" action="/logout">
					<button type="submit" class="mobile-link mobile-logout">Cerrar Sesión</button>
				</form>
			{:else}
				<a href="/login" class="mobile-link" onclick={closeMenu}>Iniciar Sesión</a>
			{/if}
		</div>
	{/if}
</nav>

{@render children()}

<style>
	/* ─── CSS Custom Properties ─────────────────────────── */
	:global(:root) {
		--color-primary: #1f4e79;
		--color-primary-light: #2563a8;
		--color-primary-dark: #163b5e;
		--color-surface: #ffffff;
		--color-bg: #f4f6f9;
		--color-border: #e2e8f0;
		--color-text: #1a202c;
		--color-text-muted: #64748b;
		--color-text-subtle: #94a3b8;
		--color-success-bg: #f0fdf4;
		--color-success-border: #4ade80;
		--color-success-text: #166534;
		--color-error-bg: #fef2f2;
		--color-error-border: #f87171;
		--color-error-text: #991b1b;
		--color-info-bg: #eff6ff;
		--color-info-border: #60a5fa;
		--color-info-text: #1d4ed8;
		--radius-sm: 6px;
		--radius-md: 8px;
		--radius-lg: 12px;
		--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
		--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
		--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
		--transition: all 0.15s ease;
		--font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			sans-serif;
		--font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
	}

	/* ─── Global Reset ──────────────────────────────────── */
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: var(--font-system);
		background-color: var(--color-bg);
		color: var(--color-text);
		font-size: 14px;
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}

	/* ─── Nav ───────────────────────────────────────────── */
	.global-nav {
		background-color: var(--color-primary);
		color: white;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.nav-inner {
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 0 20px;
		height: 52px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.nav-brand {
		color: white;
		font-weight: 700;
		font-size: 15px;
		text-decoration: none;
		letter-spacing: 0.3px;
		flex-shrink: 0;
		margin-right: 8px;
	}

	.nav-links {
		display: flex;
		gap: 2px;
		flex: 1;
	}

	.nav-link {
		color: rgba(255, 255, 255, 0.82);
		text-decoration: none;
		font-size: 14px;
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		transition: var(--transition);
		white-space: nowrap;
	}

	.nav-link:hover {
		background-color: rgba(255, 255, 255, 0.14);
		color: white;
	}

	.nav-auth {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.nav-account {
		font-weight: 500;
	}

	.btn-logout {
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.25);
		color: white;
		font-size: 13px;
		font-family: var(--font-system);
		padding: 5px 12px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-logout:hover {
		background: rgba(255, 255, 255, 0.22);
	}

	/* ─── Hamburger (mobile) ────────────────────────────── */
	.hamburger {
		display: none;
		flex-direction: column;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		margin-left: auto;
		border-radius: var(--radius-sm);
		transition: var(--transition);
	}

	.hamburger:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.bar {
		display: block;
		width: 20px;
		height: 2px;
		background: white;
		border-radius: 2px;
		transition: var(--transition);
	}

	/* ─── Mobile menu ───────────────────────────────────── */
	.mobile-menu {
		background: var(--color-primary-dark);
		padding: 8px 12px 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mobile-link {
		display: block;
		color: rgba(255, 255, 255, 0.88);
		text-decoration: none;
		font-size: 14px;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		transition: var(--transition);
		background: none;
		border: none;
		font-family: var(--font-system);
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.mobile-link:hover {
		background: rgba(255, 255, 255, 0.12);
		color: white;
	}

	.mobile-divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.12);
		margin: 6px 0;
	}

	.mobile-logout {
		color: rgba(255, 200, 200, 0.9);
	}

	/* ─── Responsive ────────────────────────────────────── */
	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.desktop-auth {
			display: none;
		}

		.hamburger {
			display: flex;
		}

		.nav-inner {
			padding: 0 16px;
		}
	}
</style>
