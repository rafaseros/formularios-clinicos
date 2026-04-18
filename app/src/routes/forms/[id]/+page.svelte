<script lang="ts">
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';
	import { enhance } from '$app/forms';

	let { data, form: actionForm } = $props();
	const form = $derived(data.form);
	const user = $derived(data.user);
	const comments = $derived(data.comments);
	const pageConfig = $derived(form.pageConfig as {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('es-BO', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	let commentText = $state('');
</script>

<svelte:head>
	<title>{form.code} — {form.name}</title>
</svelte:head>

<div class="form-viewer">
	<header class="viewer-header">
		<div class="header-left">
			<a href="/" class="back-link">← Volver</a>
			<div class="form-info">
				<span class="form-code">{form.code}</span>
				<h1>{form.name}</h1>
				<p>{form.description}</p>
			</div>
		</div>
		<div class="header-actions">
			{#if user?.canPrint || user?.role === 'admin'}
				<a href="/api/forms/{form.id}/pdf" target="_blank" class="btn btn-pdf">Descargar PDF</a>
				<a href="/forms/{form.id}/print" target="_blank" class="btn btn-print">Imprimir</a>
			{/if}
		</div>
	</header>

	<div class="viewer-body">
		<LetterVisualizer
			formId={form.id}
			orientation={pageConfig.orientation}
			margins={pageConfig.margins}
		/>
	</div>

	<!-- Comments section -->
	<div class="comments-section">
		<div class="comments-inner">
			<h2 class="comments-title">Comentarios</h2>

			{#if actionForm?.commentError}
				<div class="comment-error">{actionForm.commentError}</div>
			{/if}

			{#if comments.length === 0}
				<p class="no-comments">Sin comentarios aún.</p>
			{:else}
				<ul class="comment-list">
					{#each comments as comment (comment.id)}
						<li class="comment-item">
							<div class="comment-meta">
								<span class="comment-author">{comment.displayName || comment.username}</span>
								<span class="comment-date">{formatDate(comment.createdAt)}</span>
								{#if comment.status === 'resolved'}
									<span class="badge badge-resolved">Resuelto</span>
								{:else}
									<span class="badge badge-open">Abierto</span>
								{/if}
							</div>
							<p class="comment-content">{comment.content}</p>
							{#if user?.role === 'admin' && comment.status === 'open'}
								<form
									method="POST"
									action="?/resolveComment"
									use:enhance
									style="display:inline"
								>
									<input type="hidden" name="commentId" value={comment.id} />
									<button type="submit" class="btn-resolve">Marcar como resuelto</button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if user}
				<div class="add-comment">
					<h3>Agregar comentario</h3>
					<form
						method="POST"
						action="?/addComment"
						use:enhance={() => {
							return ({ result, update }) => {
								if (result.type === 'success') {
									commentText = '';
								}
								update();
							};
						}}
					>
						<textarea
							name="content"
							bind:value={commentText}
							placeholder="Escribí tu comentario..."
							rows="3"
							required
						></textarea>
						<button type="submit" class="btn-add-comment">Enviar comentario</button>
					</form>
				</div>
			{:else}
				<p class="login-prompt">
					<a href="/login">Iniciá sesión</a> para agregar comentarios.
				</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.form-viewer {
		min-height: calc(100vh - 52px);
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	/* ─── Header ──────────────────────────────────────── */
	.viewer-header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: 10px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
		gap: 12px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		flex: 1;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--color-primary);
		text-decoration: none;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		transition: var(--transition);
	}

	.back-link:hover {
		background: var(--color-info-bg);
		text-decoration: none;
	}

	.form-info {
		border-left: 1px solid var(--color-border);
		padding-left: 14px;
		min-width: 0;
	}

	.form-code {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-text-subtle);
		display: block;
		margin-bottom: 2px;
	}

	.form-info h1 {
		font-size: 14px;
		font-weight: 600;
		margin: 0 0 2px;
		color: var(--color-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.form-info p {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-shrink: 0;
	}

	.btn {
		display: inline-block;
		padding: 7px 14px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-system);
		text-decoration: none;
		transition: var(--transition);
		white-space: nowrap;
	}

	.btn-pdf {
		background: var(--color-primary);
		color: white;
	}

	.btn-pdf:hover {
		background: var(--color-primary-light);
	}

	.btn-print {
		background: var(--color-surface);
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.btn-print:hover {
		background: var(--color-info-bg);
	}

	/* ─── Viewer body ─────────────────────────────────── */
	.viewer-body {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		overflow: auto;
	}

	/* ─── Comments section ────────────────────────────── */
	.comments-section {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		padding: 32px 24px;
	}

	.comments-inner {
		max-width: 760px;
		margin: 0 auto;
	}

	.comments-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-primary);
		margin: 0 0 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--color-border);
	}

	.comment-error {
		background: var(--color-error-bg);
		border: 1px solid var(--color-error-border);
		border-left-width: 3px;
		color: var(--color-error-text);
		font-size: 13px;
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		margin-bottom: 16px;
	}

	.no-comments {
		color: var(--color-text-subtle);
		font-size: 13px;
		font-style: italic;
	}

	.comment-list {
		list-style: none;
		margin: 0 0 28px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.comment-item {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 14px 16px;
		background: var(--color-bg);
		transition: var(--transition);
	}

	.comment-item:hover {
		border-color: #cbd5e1;
	}

	.comment-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.comment-author {
		font-weight: 600;
		font-size: 13px;
		color: var(--color-text);
	}

	.comment-date {
		font-size: 11px;
		color: var(--color-text-subtle);
	}

	.badge {
		font-size: 10px;
		font-weight: 600;
		border-radius: 20px;
		padding: 2px 8px;
	}

	.badge-open {
		background: var(--color-info-bg);
		color: var(--color-info-text);
		border: 1px solid var(--color-info-border);
	}

	.badge-resolved {
		background: var(--color-success-bg);
		color: var(--color-success-text);
		border: 1px solid var(--color-success-border);
	}

	.comment-content {
		font-size: 13px;
		color: var(--color-text);
		margin: 0 0 10px;
		white-space: pre-wrap;
		line-height: 1.6;
	}

	.btn-resolve {
		background: none;
		border: 1px solid var(--color-success-border);
		color: var(--color-success-text);
		font-size: 11px;
		font-family: var(--font-system);
		font-weight: 600;
		padding: 3px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-resolve:hover {
		background: var(--color-success-bg);
	}

	/* ─── Add comment ─────────────────────────────────── */
	.add-comment {
		border-top: 1px solid var(--color-border);
		padding-top: 24px;
	}

	.add-comment h3 {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 10px;
	}

	.add-comment textarea {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
		font-size: 13px;
		font-family: var(--font-system);
		resize: vertical;
		box-sizing: border-box;
		transition: var(--transition);
		background: var(--color-bg);
		color: var(--color-text);
		line-height: 1.5;
	}

	.add-comment textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		background: var(--color-surface);
		box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.08);
	}

	.add-comment textarea::placeholder {
		color: var(--color-text-subtle);
	}

	.btn-add-comment {
		margin-top: 10px;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		padding: 9px 20px;
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-system);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-add-comment:hover {
		background: var(--color-primary-light);
	}

	.login-prompt {
		font-size: 13px;
		color: var(--color-text-muted);
		border-top: 1px solid var(--color-border);
		padding-top: 20px;
	}

	.login-prompt a {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
	}

	.login-prompt a:hover {
		text-decoration: underline;
	}

	/* ─── Responsive ──────────────────────────────────── */
	@media (max-width: 768px) {
		.viewer-header {
			padding: 8px 12px;
			flex-wrap: wrap;
		}

		.header-left {
			gap: 8px;
			width: 100%;
		}

		.form-info {
			padding-left: 10px;
		}

		.header-actions {
			width: 100%;
		}

		.viewer-body {
			padding: 12px;
			overflow-x: auto;
			justify-content: flex-start;
		}

		.comments-section {
			padding: 20px 14px;
		}
	}
</style>
