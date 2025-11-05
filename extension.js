const vscode = require('vscode');
// const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const { pushCustomCode } = require('./campaignScripts/customCode');

class UrlConfigViewProvider {
    constructor(context) {
        this._context = context;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        let currentUrl = '';
        
        if (workspaceFolder) {
            const settingsPath = path.join(workspaceFolder, 'settings.json');
            if (fs.existsSync(settingsPath)) {
                try {
                    const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
                    const settings = JSON.parse(settingsContent);
                    currentUrl = settings.url || '';
                } catch (err) {
                    console.error('Error reading settings:', err);
                }
            }
        }

        webviewView.webview.html = this.getWebviewContent(currentUrl);

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'saveUrl':
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                    if (!workspaceFolder) {
                        vscode.window.showErrorMessage('Please open a workspace folder first.');
                        return;
                    }

                    const settingsPath = path.join(workspaceFolder, 'settings.json');
                    let settings = {};
                    
                    // Read existing settings if they exist
                    if (fs.existsSync(settingsPath)) {
                        try {
                            const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
                            settings = JSON.parse(settingsContent);
                        } catch (err) {
                            console.error('Error reading existing settings:', err);
                        }
                    }

                    // Update URL
                    settings.url = message.url;

                    try {
                        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
                        vscode.window.showInformationMessage(`✅ URL saved: ${message.url}`);
                    } catch (err) {
                        vscode.window.showErrorMessage('Failed to save settings.json');
                        console.error(err);
                    }
                    return;

                case 'runPreview':
                    vscode.commands.executeCommand('dy-code-preview.run');
                    return;
            }
        });
    }

    getWebviewContent(currentUrl) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            padding: 15px;
            font-family: var(--vscode-font-family);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 500;
        }
        input[type="text"] {
            width: 100%;
            padding: 6px 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            box-sizing: border-box;
            font-size: 13px;
        }
        input[type="text"]:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            padding: 6px 14px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            font-size: 13px;
            margin-right: 8px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .button-group {
            display: flex;
            gap: 8px;
        }
    </style>
</head>
<body>
    <div class="form-group">
        <label for="url">Preview URL:</label>
        <input type="text" id="url" value="${currentUrl}" placeholder="https://example.com">
    </div>
    <div class="button-group">
        <button onclick="saveUrl()">Save URL</button>
        <button onclick="runPreview()">Run Preview</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function saveUrl() {
            const url = document.getElementById('url').value;
            vscode.postMessage({
                command: 'saveUrl',
                url: url
            });
        }

        function runPreview() {
            vscode.postMessage({
                command: 'runPreview'
            });
        }
    </script>
</body>
</html>`;
    }
}

function activate(context) {
    // Register webview view provider
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

        // try {
        //     const browser = await puppeteer.launch({
        //         headless: false,
        //         defaultViewport: null
        //     });

        //     const page = await browser.newPage();
        //     await page.goto(url);

        //     const injectedFunction = pushCustomCode.toString();
        //     await page.evaluate(`
        //         (${injectedFunction})(${JSON.stringify(jsCode)})
        //     `);

        //     vscode.window.showInformationMessage(`✅ Opened page ${url} and executed JS!`);
        // } catch (err) {
        //     console.error(err);
        //     vscode.window.showErrorMessage('Failed to open page or run JS.');
        // }
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
