type PrintableTemplate = {
	code: string;
	name: string;
	commonCss: string;
	inlineCss: string;
	htmlBody: string;
};

export function buildPrintableHtml(template: PrintableTemplate): string {
	return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${template.code} ${template.name}</title>
    <style>
${template.commonCss}
    </style>
    <style>
${template.inlineCss}
    </style>
</head>
<body>
${template.htmlBody}
</body>
</html>`;
}
