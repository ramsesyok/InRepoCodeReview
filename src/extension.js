const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function checkAndActivateCodeReview() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const rootPath = workspaceFolders[0].uri.fsPath;
        const codereviewPath = path.join(rootPath, '.codereview');
        
        if (fs.existsSync(codereviewPath)) {
            console.log('.codereview folder found - activating code review features');
            vscode.window.showInformationMessage('Code review folder detected. InRepoCodeReview is ready!');
        }
    }
}

async function createCodeReviewFolder() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const codereviewPath = path.join(rootPath, '.codereview');

    try {
        if (!fs.existsSync(codereviewPath)) {
            fs.mkdirSync(codereviewPath, { recursive: true });
            vscode.window.showInformationMessage('.codereview folder created successfully!');
        } else {
            vscode.window.showInformationMessage('.codereview folder already exists.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create .codereview folder: ${error.message}`);
    }
}

function activate(context) {
    console.log('InRepoCodeReview extension is now active!');

    // Check for .codereview folder on startup
    checkAndActivateCodeReview();

    let disposable = vscode.commands.registerCommand('inrepocodereview.openReview', async function () {
        await createCodeReviewFolder();
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};