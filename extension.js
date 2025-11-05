const vscode = require('vscode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const { pushCustomCode } = require('./campaignScripts/customCode');

function activate(context) {
	const disposable = vscode.commands.registerCommand('dy-code-preview.run', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}

		const templatePath = path.join(workspaceFolder, 'template.js');
		if (!fs.existsSync(templatePath)) {
			vscode.window.showErrorMessage('template.js not found in workspace folder.');
			return;
		}
		const jsCode = fs.readFileSync(templatePath, 'utf-8');

		const settingsPath = path.join(workspaceFolder, 'settings.json');
		if (!fs.existsSync(settingsPath)) {
			vscode.window.showErrorMessage('settings.json not found in workspace folder.');
			return;
		}

		let url;
		try {
			const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
			const settings = JSON.parse(settingsContent);
			if (!settings.url) {
				vscode.window.showErrorMessage('`url` property not found in settings.json');
				return;
			}
			url = settings.url;
		} catch (err) {
			vscode.window.showErrorMessage('Failed to read settings.json');
			console.error(err);
			return;
		}

		try {
			const browser = await puppeteer.launch({
				headless: false,
				defaultViewport: null
			});

			const page = await browser.newPage();
			await page.goto(url);

			const injectedFunction = pushCustomCode.toString();
			await page.evaluate(`
				(${injectedFunction})(${JSON.stringify(jsCode)})
			`);

			vscode.window.showInformationMessage(`✅ Opened page ${url} and executed JS!`);
		} catch (err) {
			console.error(err);
			vscode.window.showErrorMessage('Failed to open page or run JS.');
		}
	});

	context.subscriptions.push(disposable);

	const createCampaignCommand = vscode.commands.registerCommand('dy-code-preview.createCampaign', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}

		const folderName = await vscode.window.showInputBox({
			prompt: 'Enter folder name for the campaign',
			placeHolder: 'my-campaign'
		});

		if (!folderName) {
			vscode.window.showInformationMessage('Campaign creation canceled.');
			return;
		}

		const campaignType = await vscode.window.showQuickPick(
			['custom code', 'dynamic content'],
			{ placeHolder: 'Select campaign type' }
		);

		if (!campaignType) {
			vscode.window.showInformationMessage('Campaign creation canceled.');
			return;
		}

		try {
			const campaignFolder = path.join(workspaceFolder, folderName);

			if (!fs.existsSync(campaignFolder)) {
				fs.mkdirSync(campaignFolder);
			} else {
				vscode.window.showWarningMessage(`Folder "${folderName}" already exists. Files will be overwritten.`);
			}

			const settings = {
				url: "",
				type: campaignType
			};
			fs.writeFileSync(path.join(campaignFolder, 'settings.json'), JSON.stringify(settings, null, 2));

			fs.writeFileSync(path.join(campaignFolder, 'script.js'), '// Your JS code here');

			vscode.window.showInformationMessage(`✅ Campaign folder "${folderName}" created with type "${campaignType}"`);
		} catch (err) {
			vscode.window.showErrorMessage('Failed to create campaign folder or files.');
			console.error(err);
		}
	});

	context.subscriptions.push(createCampaignCommand);
}

function deactivate() { }

module.exports = { activate, deactivate };
