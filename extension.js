const vscode = require('vscode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function activate(context) {
	console.log('Puppeteer opener extension is active!');

	const disposable = vscode.commands.registerCommand('dy-code-preview.run', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}

		// Load JS code from template.js
		const templatePath = path.join(workspaceFolder, 'template.js');
		if (!fs.existsSync(templatePath)) {
			vscode.window.showErrorMessage('template.js not found in workspace folder.');
			return;
		}
		const jsCode = fs.readFileSync(templatePath, 'utf-8');

		// URL to open
		const url = 'https://www.peugeot.fr/'; // Adjust if needed

		try {
			// Launch Chrome with Puppeteer
			const browser = await puppeteer.launch({
				headless: false, // Open full Chrome
				defaultViewport: null
			});

			const page = await browser.newPage();
			await page.goto(url);

			// Run JS from template.js
			await page.evaluate(jsCode);

			vscode.window.showInformationMessage('✅ Page opened and JS executed!');
		} catch (err) {
			console.error(err);
			vscode.window.showErrorMessage('Failed to open page or run JS.');
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };
