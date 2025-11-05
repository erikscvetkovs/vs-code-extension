const vscode = require('vscode');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const { pushCustomCode } = require('./campaignScripts/customCode/customCode');
const { pushDynamicContent } = require("./campaignScripts/dynamicContent/dynamicContent")

class UrlConfigViewProvider {
	constructor(context) {
		this._context = context;
		this._view = null;
		this._watcher = null;
	}

	resolveWebviewView(webviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true
		};

		this.updateWebview();

		webviewView.webview.onDidReceiveMessage(message => {
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

			switch (message.command) {
				case 'saveSettings':
					if (!workspaceFolder) {
						vscode.window.showErrorMessage('Please open a workspace folder first.');
						return;
					}

					const settingsPath = path.join(workspaceFolder, 'settings.json');
					const settings = {
						url: message.url,
						type: message.type
					};

					try {
						fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
						vscode.window.showInformationMessage(`✅ Settings saved!`);
					} catch (err) {
						vscode.window.showErrorMessage('Failed to save settings.json');
						console.error(err);
					}
					return;

				case 'saveVariables':
					if (!workspaceFolder) {
						vscode.window.showErrorMessage('Please open a workspace folder first.');
						return;
					}

					const variablesPath = path.join(workspaceFolder, 'variables.json');

					try {
						fs.writeFileSync(variablesPath, JSON.stringify(message.variables, null, 2));
						vscode.window.showInformationMessage(`✅ Variables saved!`);

						// Update webview to reflect saved changes
						this.updateWebview();
					} catch (err) {
						vscode.window.showErrorMessage('Failed to save variables.json');
						console.error(err);
					}
					return;

				case 'runPreview':
					vscode.commands.executeCommand('dy-code-preview.run');
					return;
			}
		});

		// Watch for file changes to update webview
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceFolder) {
			this.watchFiles(workspaceFolder);
		}
	}

	watchFiles(workspaceFolder) {
		if (!workspaceFolder) return;

		// Dispose previous watcher if it exists
		if (this._watcher) {
			this._watcher.dispose();
		}

		// Watch for changes to settings.json and variables.json
		this._watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(workspaceFolder, '{settings.json,variables.json}')
		);

		this._watcher.onDidChange(() => {
			this.updateWebview();
		});

		this._watcher.onDidCreate(() => {
			this.updateWebview();
		});

		this._watcher.onDidDelete(() => {
			this.updateWebview();
		});
	}

	updateWebview() {
		if (!this._view) return;

		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		let currentUrl = '';
		let currentType = 'custom code';
		let variables = [];

		if (workspaceFolder) {
			const settingsPath = path.join(workspaceFolder, 'settings.json');
			if (fs.existsSync(settingsPath)) {
				try {
					const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
					const settings = JSON.parse(settingsContent);
					currentUrl = settings.url || '';
					currentType = settings.type || 'custom code';
				} catch (err) {
					console.error('Error reading settings:', err);
				}
			}

			const variablesPath = path.join(workspaceFolder, 'variables.json');
			if (fs.existsSync(variablesPath)) {
				try {
					const variablesContent = fs.readFileSync(variablesPath, 'utf-8');
					variables = JSON.parse(variablesContent);
				} catch (err) {
					console.error('Error reading variables:', err);
				}
			}
		}

		this._view.webview.html = this.getWebviewContent(currentUrl, currentType, variables);
	}

	getWebviewContent(currentUrl, currentType, variables) {
		const variablesJson = JSON.stringify(variables);

		return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }
        .form-group {
            margin-bottom: 12px;
        }
        label {
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        input[type="text"], select {
            width: 100%;
            padding: 6px 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            box-sizing: border-box;
            font-size: 13px;
        }
        input[type="text"]:focus, select:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            padding: 6px 14px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            font-size: 12px;
            margin: 10px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .variable-item {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            align-items: flex-start;
        }
        .variable-item input {
            flex: 1;
        }
        .variable-item button {
            margin: 0;
            padding: 6px 10px;
            background: var(--vscode-button-secondaryBackground);
        }
        .button-group {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
        #variablesList {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="section">
        <div class="section-title">Campaign Settings</div>
        <div class="form-group">
            <label for="url">Preview URL:</label>
            <input type="text" id="url" value="${currentUrl}" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label for="campaignType">Campaign Type:</label>
            <select id="campaignType">
                <option value="custom code" ${currentType === 'custom code' ? 'selected' : ''}>Custom Code</option>
                <option value="dynamic content" ${currentType === 'dynamic content' ? 'selected' : ''}>Dynamic Content</option>
            </select>
        </div>
        <button onclick="saveSettings()">Save Settings</button>
    </div>

    <div class="section">
        <div class="section-title">DY Variables</div>
        <div id="variablesList"></div>
        <button class="secondary" onclick="addVariable()">+ Add Variable</button>
        <button onclick="saveVariables()">Save Variables</button>
    </div>

    <div class="section">
        <div class="section-title">Actions</div>
        <button onclick="runPreview()">▶ Run Preview</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let variables = ${variablesJson};

        function renderVariables() {
            const container = document.getElementById('variablesList');
            container.innerHTML = '';
            
            if (variables.length === 0) {
                container.innerHTML = '<p style="font-size: 12px; color: var(--vscode-descriptionForeground);">No variables defined yet.</p>';
                return;
            }
            
            variables.forEach((variable, index) => {
                const div = document.createElement('div');
                div.className = 'variable-item';
                div.innerHTML = \`
                    <input type="text" placeholder="Variable name" value="\${variable.name || ''}" onchange="updateVariable(\${index}, 'name', this.value)">
                    <input type="text" placeholder="Variable value" value="\${variable.value || ''}" onchange="updateVariable(\${index}, 'value', this.value)">
                    <button onclick="removeVariable(\${index})">×</button>
                \`;
                container.appendChild(div);
            });
        }

        function addVariable() {
            variables.push({ name: '', value: '' });
            renderVariables();
        }

        function removeVariable(index) {
            variables.splice(index, 1);
            renderVariables();
        }

        function updateVariable(index, field, value) {
            variables[index][field] = value;
        }

        function saveSettings() {
            const url = document.getElementById('url').value;
            const type = document.getElementById('campaignType').value;
            vscode.postMessage({
                command: 'saveSettings',
                url: url,
                type: type
            });
        }

        function saveVariables() {
            // Filter out empty variables
            const validVariables = variables.filter(v => v.name && v.value);
            vscode.postMessage({
                command: 'saveVariables',
                variables: validVariables
            });
        }

        function runPreview() {
            vscode.postMessage({
                command: 'runPreview'
            });
        }

        renderVariables();
    </script>
</body>
</html>`;
	}
}

function activate(context) {
	const urlConfigProvider = new UrlConfigViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('dy-code-preview-view', urlConfigProvider)
	);

	const disposable = vscode.commands.registerCommand('dy-code-preview.run', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('Please open a workspace folder first.');
			return;
		}

		const scriptPath = path.join(workspaceFolder, 'template.js');
		const htmlPath = path.join(workspaceFolder, 'template.html');
		const cssPath = path.join(workspaceFolder, 'style.css');

		if (!fs.existsSync(scriptPath)) {
			vscode.window.showErrorMessage('template.js not found in workspace folder.');
			return;
		}

		let jsCode = fs.readFileSync(scriptPath, 'utf-8');

		const variablesPath = path.join(workspaceFolder, 'variables.json');
		if (fs.existsSync(variablesPath)) {
			try {
				const variablesContent = fs.readFileSync(variablesPath, 'utf-8');
				const variables = JSON.parse(variablesContent);

				let variablesCode = '// DY Variables\n';
				variables.forEach(variable => {
					if (variable.name && variable.value) {
						variablesCode += `var ${variable.name} = "${variable.value}";\n`;
					}
				});

				jsCode = variablesCode + '\n' + jsCode;
			} catch (err) {
				console.error('Error reading variables.json:', err);
			}
		}

		let html = '';
		if (fs.existsSync(htmlPath)) {
			try {
				html = fs.readFileSync(htmlPath, 'utf-8');
			} catch (err) {
				console.error('Error reading template.html:', err);
			}
		}

		let css = '';
		if (fs.existsSync(cssPath)) {
			try {
				css = fs.readFileSync(cssPath, 'utf-8');
			} catch (err) {
				console.error('Error reading style.css:', err);
			}
		}

		const settingsPath = path.join(workspaceFolder, 'settings.json');
		if (!fs.existsSync(settingsPath)) {
			vscode.window.showErrorMessage('settings.json not found in workspace folder.');
			return;
		}

		let settings;
		let url;
		try {
			const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
			settings = JSON.parse(settingsContent);
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
			await page.goto(url, { waitUntil: 'networkidle2' });

			// Inject CSS into the page
			if (css) {
				try {
					await page.addStyleTag({ content: css });
				} catch (err) {
					console.error('Failed to inject CSS:', err);
				}
			}

			// If there's HTML content, append it into the body
			if (html) {
				try {
					await page.evaluate((content) => {
						document.body.insertAdjacentHTML('beforeend', content);
					}, html);
				} catch (err) {
					console.error('Failed to inject HTML:', err);
				}
			}

			let injectedFunction;

			switch (settings.type) {
				case 'custom code':
					injectedFunction = pushCustomCode.toString();
					await page.evaluate(`
						(${injectedFunction})(${JSON.stringify(html)}, ${JSON.stringify(css)}, ${JSON.stringify(jsCode)})
					`);
					break;
				case 'dynamic content':
					injectedFunction = pushDynamicContent.toString();
					await page.evaluate(`
						(${injectedFunction})(${JSON.stringify(html)}, ${JSON.stringify(css)}, ${JSON.stringify(jsCode)},  ${JSON.stringify(settings)})
					`);
					break;
				default:
					vscode.window.showErrorMessage(`❌ Unsupported code type: ${settings.type}`);
					return;
			}

			vscode.window.showInformationMessage(`✅ Opened page ${url} and executed ${settings.type}!`);
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

			fs.writeFileSync(path.join(campaignFolder, 'template.js'), '// Your JS code here');

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