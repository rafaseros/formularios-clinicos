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
			<a
				href="/api/forms/{form.id}/pdf"
				target="_blank"
				rel="noopener"
				class="btn btn-pdf"
			>
				Descargar PDF
			</a>
			<a
				href="/forms/{form.id}/print"
				target="_blank"
				rel="noopener"
				class="btn btn-print"
			>
				Imprimir / PDF
			</a>
		</div>
	</header>

	<div class="viewer-body">
		<LetterVisualizer
			formId={form.id}
			orientation={pageConfig.orientation}
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
		min-height: 100vh;
		background-color: #e8e8e8;
		display: flex;
		flex-direction: column;
	}

	.viewer-header {
		background: white;
		border-bottom: 1px solid #ddd;
		padding: 12px 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.back-link {
		color: #1F4E79;
		text-decoration: none;
		font-size: 14px;
		white-space: nowrap;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.form-info {
		border-left: 1px solid #ddd;
		padding-left: 16px;
	}

	.form-code {
		font-family: monospace;
		font-size: 12px;
		color: #666;
	}

	.form-info h1 {
		font-size: 16px;
		margin: 2px 0;
		color: #1F4E79;
	}

	.form-info p {
		font-size: 12px;
		color: #888;
		margin: 0;
	}

	.btn-pdf {
		display: inline-block;
		padding: 8px 20px;
		background-color: #2E7D32;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.btn-pdf:hover {
		background-color: #1B5E20;
	}

	.btn-print {
		display: inline-block;
		padding: 8px 20px;
		background-color: #1F4E79;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.btn-print:hover {
		background-color: #1565C0;
	}

	.viewer-body {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 24px;
		overflow: auto;
	}

	/* Comments */
	.comments-section {
		background: white;
		border-top: 1px solid #ddd;
		padding: 32px 24px;
	}

	.comments-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	.comments-title {
		font-size: 18px;
		color: #1F4E79;
		margin: 0 0 20px;
		padding-bottom: 10px;
		border-bottom: 2px solid #e0e0e0;
	}

	.comment-error {
		background: #FFEBEE;
		border-left: 4px solid #E53935;
		color: #B71C1C;
		font-size: 14px;
		padding: 10px 14px;
		border-radius: 4px;
		margin-bottom: 16px;
	}

	.no-comments {
		color: #999;
		font-size: 14px;
		font-style: italic;
	}

	.comment-list {
		list-style: none;
		margin: 0 0 28px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.comment-item {
		border: 1px solid #e0e0e0;
		border-radius: 6px;
		padding: 14px 16px;
		background: #fafafa;
	}

	.comment-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
		flex-wrap: wrap;
	}

	.comment-author {
		font-weight: 600;
		font-size: 13px;
		color: #333;
	}

	.comment-date {
		font-size: 12px;
		color: #999;
	}

	.badge {
		font-size: 11px;
		border-radius: 3px;
		padding: 2px 7px;
		font-weight: 600;
	}

	.badge-open {
		background: #E3F2FD;
		color: #1565C0;
		border: 1px solid #90CAF9;
	}

	.badge-resolved {
		background: #E8F5E9;
		color: #2E7D32;
		border: 1px solid #A5D6A7;
	}

	.comment-content {
		font-size: 14px;
		color: #333;
		margin: 0 0 10px;
		white-space: pre-wrap;
		line-height: 1.5;
	}

	.btn-resolve {
		background: none;
		border: 1px solid #2E7D32;
		color: #2E7D32;
		font-size: 12px;
		padding: 3px 10px;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-resolve:hover {
		background: #E8F5E9;
	}

	.add-comment {
		border-top: 1px solid #e0e0e0;
		padding-top: 24px;
	}

	.add-comment h3 {
		font-size: 15px;
		color: #444;
		margin: 0 0 12px;
	}

	.add-comment textarea {
		width: 100%;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 10px 12px;
		font-size: 14px;
		font-family: inherit;
		resize: vertical;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}

	.add-comment textarea:focus {
		outline: none;
		border-color: #1F4E79;
		box-shadow: 0 0 0 2px rgba(31, 78, 121, 0.1);
	}

	.btn-add-comment {
		margin-top: 10px;
		background: #1F4E79;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 8px 20px;
		font-size: 14px;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.btn-add-comment:hover {
		background: #1565C0;
	}

	.login-prompt {
		font-size: 14px;
		color: #666;
		border-top: 1px solid #e0e0e0;
		padding-top: 20px;
	}

	.login-prompt a {
		color: #1F4E79;
		font-weight: 600;
		text-decoration: none;
	}

	.login-prompt a:hover {
		text-decoration: underline;
	}
</style>
