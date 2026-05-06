# Changelog — PGB-F015 Epicrisis / Nota de Egreso

## v1.1 — 2026-05-05

**Cambios** (observaciones de la clínica):

- **Tipo de egreso**: opciones actualizadas a `Alta Médica`, `Alta Solicitada`, `Fuga`, `Transferencia`. Reemplazan a las anteriores `Alta médica`, `Alta voluntaria`, `Fuga`, `Fallecimiento`.
- **Diagnóstico de ingreso**: campo removido (junto con su CIE-10 asociado). Solo se conserva el diagnóstico y CIE-10 de egreso, que es lo que aplica al cierre del proceso.
- **Sección E (Condición al egreso)**: removidos los campos `Estado clínico al egreso` y `Referencia a`. El espacio queda compactado, sin redistribución entre los campos restantes.
- **Sección F**: renombrada de `PRONÓSTICO Y RECOMENDACIONES` a `RECOMENDACIONES`. Se removieron los campos `Pronóstico` y `Plan de prevención de recaídas`. Queda únicamente `Recomendaciones de seguimiento`.

**Razón**: el equipo clínico considera que parte de esta información se cubre en otros formularios (F006 Historia Clínica, F007 Nota de Ingreso Médica). Las opciones de tipo de egreso se ajustan al vocabulario formal de la clínica. La compactación responde al pedido del equipo de no recargar el formulario con campos redundantes.

## v1.0 — Versión inicial

Versión inicial conforme a normativa SEDES (D.S. 28562, R.M. 0090/2008).
