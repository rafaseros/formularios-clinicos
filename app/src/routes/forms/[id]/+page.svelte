<script lang="ts">
	import LetterVisualizer from '$lib/components/LetterVisualizer.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form: actionForm } = $props();
	const form = $derived(data.form);
	const user = $derived(data.user);
	const comments = $derived(data.comments);
	const allVersions = $derived(data.allVersions);
	const isLatest = $derived(data.isLatest);
	const latestId = $derived(data.latestId);
	const compareDefaultId = $derived(data.compareDefaultId);
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
	let replyOpenFor = $state<number | null>(null);
	let replyText = $state('');

	function onVersionChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		if (select.value && Number(select.value) !== form.id) {
			goto(`/forms/${select.value}`);
		}
	}
</script>

<svelte:head>
	<title>{form.code} v{form.version} — {form.name}</title>
</svelte:head>

<div class="form-viewer">
	<header class="viewer-header">
		<div class="header-left">
			<a href="/" class="back-link">← Volver</a>
			<div class="form-info">
				<span class="form-code">{form.code} v{form.version}</span>
				<h1>{form.name}</h1>
				<p>{form.description}</p>
			</div>
		</div>
		<div class="header-actions">
			{#if allVersions.length > 1}
				<select class="version-select" value={form.id} onchange={onVersionChange} title="Cambiar versión">
					{#each allVersions as v}
						<option value={v.id}>v{v.version}{v.id === latestId ? ' (actual)' : ''}</option>
					{/each}
				</select>
				{#if compareDefaultId}
					<a href="/forms/{form.id}/compare/{compareDefaultId}" class="btn btn-compare">Comparar versiones</a>
				{/if}
			{/if}
			<a href="/forms/{form.id}/manual" class="btn btn-manual">Ver manual</a>
			{#if user?.canPrint || user?.role === 'admin'}
				<a href="/api/forms/{form.id}/pdf" target="_blank" class="btn btn-pdf">Descargar PDF</a>
				<a href="/forms/{form.id}/print" target="_blank" class="btn btn-print">Imprimir</a>
			{/if}
		</div>
	</header>

	{#if !isLatest}
		<div class="historic-banner">
			<svg class="banner-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>
			<span>
				Estás viendo una versión histórica (v{form.version}).
				<a href="/forms/{latestId}">Ver versión actual →</a>
			</span>
		</div>
	{/if}

	<div class="viewer-body">
		<LetterVisualizer
			iframeSrc="/forms/{form.id}/print"
			iframeTitle="Formulario {form.code}"
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
							<div class="comment-actions">
								{#if user}
									<button
										type="button"
										class="btn-reply"
										onclick={() => {
											replyOpenFor = replyOpenFor === comment.id ? null : comment.id;
											replyText = '';
										}}
									>
										{replyOpenFor === comment.id ? 'Cancelar' : 'Responder'}
									</button>
								{/if}
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
							</div>

							{#if comment.replies.length > 0}
								<ul class="reply-list">
									{#each comment.replies as reply (reply.id)}
										<li class="reply-item">
											<div class="comment-meta">
												<span class="comment-author">{reply.displayName || reply.username}</span>
												<span class="comment-date">{formatDate(reply.createdAt)}</span>
												<span class="badge badge-reply">Respuesta</span>
											</div>
											<p class="comment-content">{reply.content}</p>
										</li>
									{/each}
								</ul>
							{/if}

							{#if replyOpenFor === comment.id && user}
								<form
									method="POST"
									action="?/addComment"
									class="reply-form"
									use:enhance={() => {
										return ({ result, update }) => {
											if (result.type === 'success') {
												replyText = '';
												replyOpenFor = null;
											}
											update();
										};
									}}
								>
									<input type="hidden" name="parentCommentId" value={comment.id} />
									<textarea
										name="content"
										bind:value={replyText}
										placeholder="Escribí tu respuesta..."
										rows="2"
										required
									></textarea>
									<button type="submit" class="btn-add-comment">Enviar respuesta</button>
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

	/* ─── Version selector ────────────────────────────── */
	.version-select {
		padding: 6px 10px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-family: var(--font-system);
		color: var(--color-text);
		background: var(--color-surface);
		cursor: pointer;
		transition: var(--transition);
	}

	.version-select:hover {
		border-color: var(--color-primary-light);
	}

	.version-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.08);
	}

	/* ─── Historic version banner ─────────────────────── */
	.historic-banner {
		background: #fffbeb;
		border-bottom: 1px solid #fcd34d;
		border-left: 3px solid #f59e0b;
		padding: 10px 20px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: #92400e;
		flex-shrink: 0;
	}

	.banner-icon {
		width: 16px;
		height: 16px;
		color: #d97706;
		flex-shrink: 0;
	}

	.historic-banner a {
		color: #92400e;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.historic-banner a:hover {
		color: #78350f;
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

	.btn-manual {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-manual:hover {
		background: var(--color-bg);
		border-color: var(--color-text-muted);
	}

	.btn-compare {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-compare:hover {
		background: var(--color-info-bg);
		border-color: var(--color-primary-light);
		color: var(--color-primary);
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

	.comment-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
	}

	.btn-reply {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-size: 11px;
		font-family: var(--font-system);
		font-weight: 600;
		padding: 3px 10px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition);
	}

	.btn-reply:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-info-bg);
	}

	.reply-list {
		list-style: none;
		margin: 12px 0 0;
		padding: 0 0 0 20px;
		border-left: 2px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.reply-item {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 10px 12px;
	}

	.badge-reply {
		background: var(--color-bg);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.reply-form {
		margin-top: 12px;
		padding-left: 20px;
		border-left: 2px dashed var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.reply-form textarea {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: 8px 10px;
		font-size: 13px;
		font-family: var(--font-system);
		resize: vertical;
		box-sizing: border-box;
		background: var(--color-bg);
		color: var(--color-text);
		line-height: 1.5;
	}

	.reply-form textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		background: var(--color-surface);
		box-shadow: 0 0 0 3px rgba(31, 78, 121, 0.08);
	}

	.reply-form .btn-add-comment {
		align-self: flex-start;
		margin-top: 0;
		padding: 6px 14px;
		font-size: 12px;
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
			flex-wrap: wrap;
		}

		.viewer-body {
			padding: 12px;
			overflow-x: auto;
			justify-content: flex-start;
		}

		.comments-section {
			padding: 20px 14px;
		}

		.historic-banner {
			padding: 10px 12px;
		}
	}
</style>
