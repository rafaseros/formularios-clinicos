<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	const vals = $derived((form as any)?.values ?? {});
</script>

<svelte:head>
	<title>Nuevo Paciente — Gilead Bolivia</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/patients">Pacientes</a>
		<span>›</span>
		<span>Nuevo Paciente</span>
	</nav>

	<h1 class="page-title">Registrar Nuevo Paciente</h1>

	{#if form?.error}
		<div class="alert-error">{form.error}</div>
	{/if}

	<form method="POST" use:enhance class="patient-form">
		<fieldset>
			<legend>Identificación</legend>
			<div class="form-row">
				<div class="field field-md">
					<label for="docNumber">C.I. <span class="required">*</span></label>
					<input
						id="docNumber"
						name="docNumber"
						type="text"
						value={vals.docNumber ?? ''}
						placeholder="Ej: 12345678"
						required
					/>
				</div>
				<div class="field field-sm">
					<label for="docExtension">Ext.</label>
					<select id="docExtension" name="docExtension">
						<option value="" selected={!vals.docExtension}>—</option>
						<option value="LP" selected={vals.docExtension === 'LP'}>LP</option>
						<option value="CB" selected={vals.docExtension === 'CB'}>CB</option>
						<option value="SC" selected={vals.docExtension === 'SC'}>SC</option>
						<option value="OR" selected={vals.docExtension === 'OR'}>OR</option>
						<option value="PT" selected={vals.docExtension === 'PT'}>PT</option>
						<option value="CH" selected={vals.docExtension === 'CH'}>CH</option>
						<option value="TJ" selected={vals.docExtension === 'TJ'}>TJ</option>
						<option value="BN" selected={vals.docExtension === 'BN'}>BN</option>
						<option value="PD" selected={vals.docExtension === 'PD'}>PD</option>
					</select>
				</div>
				<div class="field field-md">
					<label for="clinicalRecordNumber">Nro. Expediente</label>
					<input
						id="clinicalRecordNumber"
						name="clinicalRecordNumber"
						type="text"
						value={vals.clinicalRecordNumber ?? ''}
						placeholder="Ej: EXP-001"
					/>
				</div>
			</div>
		</fieldset>

		<fieldset>
			<legend>Datos Personales</legend>
			<div class="form-row">
				<div class="field field-lg">
					<label for="firstName">Nombre(s) <span class="required">*</span></label>
					<input
						id="firstName"
						name="firstName"
						type="text"
						value={vals.firstName ?? ''}
						placeholder="Ej: Juan Carlos"
						required
					/>
				</div>
			</div>
			<div class="form-row">
				<div class="field field-lg">
					<label for="paternalLastName">Apellido Paterno</label>
					<input
						id="paternalLastName"
						name="paternalLastName"
						type="text"
						value={vals.paternalLastName ?? ''}
						placeholder="Ej: García"
					/>
				</div>
				<div class="field field-lg">
					<label for="maternalLastName">Apellido Materno</label>
					<input
						id="maternalLastName"
						name="maternalLastName"
						type="text"
						value={vals.maternalLastName ?? ''}
						placeholder="Ej: López"
					/>
				</div>
			</div>
			<div class="form-row">
				<div class="field field-md">
					<label for="birthDate">Fecha de Nacimiento</label>
					<input
						id="birthDate"
						name="birthDate"
						type="date"
						value={vals.birthDate ?? ''}
					/>
				</div>
				<div class="field field-sm">
					<label for="gender">Sexo</label>
					<select id="gender" name="gender">
						<option value="">—</option>
						<option value="M" selected={vals.gender === 'M'}>Masculino</option>
						<option value="F" selected={vals.gender === 'F'}>Femenino</option>
					</select>
				</div>
			</div>
		</fieldset>

		<fieldset>
			<legend>Contacto</legend>
			<div class="form-row">
				<div class="field field-md">
					<label for="phone">Teléfono / Celular</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						value={vals.phone ?? ''}
						placeholder="Ej: 70012345"
					/>
				</div>
				<div class="field field-md">
					<label for="city">Ciudad</label>
					<input
						id="city"
						name="city"
						type="text"
						value={vals.city ?? ''}
						placeholder="Ej: La Paz"
					/>
				</div>
			</div>
			<div class="form-row">
				<div class="field field-full">
					<label for="address">Dirección</label>
					<input
						id="address"
						name="address"
						type="text"
						value={vals.address ?? ''}
						placeholder="Ej: Av. Arce 1234"
					/>
				</div>
			</div>
		</fieldset>

		<fieldset>
			<legend>Estado</legend>
			<div class="form-row">
				<div class="field field-md">
					<label for="status">Estado del Paciente</label>
					<select id="status" name="status">
						<option value="active" selected={!vals.status || vals.status === 'active'}>Activo</option>
						<option value="discharged" selected={vals.status === 'discharged'}>Alta</option>
						<option value="transferred" selected={vals.status === 'transferred'}>Transferido</option>
					</select>
				</div>
			</div>
		</fieldset>

		<div class="form-actions">
			<a href="/patients" class="btn btn-ghost">Cancelar</a>
			<button type="submit" class="btn btn-primary">Guardar Paciente</button>
		</div>
	</form>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px;
	}

	.breadcrumb {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 13px;
		color: #888;
		margin-bottom: 16px;
	}

	.breadcrumb a {
		color: #1F4E79;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.page-title {
		font-size: 22px;
		color: #1F4E79;
		margin: 0 0 24px;
		padding-bottom: 12px;
		border-bottom: 2px solid #1F4E79;
	}

	.alert-error {
		background-color: #FFEBEE;
		border-left: 4px solid #c62828;
		color: #b71c1c;
		padding: 12px 16px;
		border-radius: 4px;
		margin-bottom: 20px;
		font-size: 14px;
	}

	.patient-form fieldset {
		border: 1px solid #ddd;
		border-radius: 6px;
		padding: 16px 20px;
		margin-bottom: 20px;
	}

	.patient-form legend {
		font-weight: 600;
		font-size: 13px;
		color: #1F4E79;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 0 8px;
	}

	.form-row {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.form-row:last-child {
		margin-bottom: 0;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.field-sm { flex: 0 0 100px; }
	.field-md { flex: 1 1 180px; }
	.field-lg { flex: 1 1 240px; }
	.field-full { flex: 1 1 100%; }

	label {
		font-size: 13px;
		font-weight: 500;
		color: #444;
	}

	.required {
		color: #c62828;
	}

	input, select {
		padding: 8px 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
		background: white;
		color: #222;
	}

	input:focus, select:focus {
		outline: none;
		border-color: #1F4E79;
		box-shadow: 0 0 0 2px rgba(31, 78, 121, 0.12);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding-top: 8px;
	}

	.btn {
		display: inline-block;
		padding: 9px 20px;
		border-radius: 4px;
		font-size: 14px;
		text-decoration: none;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: background-color 0.15s;
	}

	.btn-primary {
		background-color: #1F4E79;
		color: white;
	}

	.btn-primary:hover {
		background-color: #1565C0;
	}

	.btn-ghost {
		background: transparent;
		color: #555;
		border: 1px solid #ccc;
	}

	.btn-ghost:hover {
		background-color: #f5f5f5;
	}
</style>
