import puppeteer, { type Browser } from 'puppeteer';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
	if (!browser || !browser.connected) {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
	}
	return browser;
}

export async function generatePdf(
	printUrl: string,
	pageConfig: {
		orientation: string;
		size: string;
		margins: { top: string; right: string; bottom: string; left: string };
	}
): Promise<ArrayBuffer> {
	const b = await getBrowser();
	const page = await b.newPage();
	try {
		await page.goto(printUrl, { waitUntil: 'networkidle0' });
		const pdf = await page.pdf({
			format: 'Letter',
			landscape: pageConfig.orientation === 'landscape',
			margin: {
				top: pageConfig.margins.top,
				right: pageConfig.margins.right,
				bottom: pageConfig.margins.bottom,
				left: pageConfig.margins.left
			},
			printBackground: true,
			preferCSSPageSize: true
		});
		// Copy into a plain ArrayBuffer — valid as BodyInit in all environments
		const ab = new ArrayBuffer(pdf.byteLength);
		new Uint8Array(ab).set(pdf);
		return ab;
	} finally {
		await page.close();
	}
}
