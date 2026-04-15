<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="global-nav">
	<div class="nav-inner">
		<a href="/" class="nav-brand">Gilead Bolivia</a>
		<div class="nav-links">
			<a href="/" class="nav-link">Formularios</a>
			<a href="/patients" class="nav-link">Pacientes</a>
		</div>
	</div>
</nav>

{@render children()}

<style>
	.global-nav {
		background-color: #1F4E79;
		color: white;
		padding: 0 24px;
		height: 48px;
		display: flex;
		align-items: center;
	}

	.nav-inner {
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 32px;
	}

	.nav-brand {
		color: white;
		font-weight: bold;
		font-size: 15px;
		text-decoration: none;
		letter-spacing: 0.5px;
	}

	.nav-links {
		display: flex;
		gap: 4px;
	}

	.nav-link {
		color: rgba(255, 255, 255, 0.85);
		text-decoration: none;
		font-size: 14px;
		padding: 6px 12px;
		border-radius: 4px;
		transition: background-color 0.15s;
	}

	.nav-link:hover {
		background-color: rgba(255, 255, 255, 0.15);
		color: white;
	}
</style>
