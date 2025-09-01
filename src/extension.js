const vscode = require('vscode');

function activate(context) {
    console.log('InRepoCodeReview extension is now active!');

    let disposable = vscode.commands.registerCommand('inrepocodereview.openReview', function () {
        vscode.window.showInformationMessage('Welcome to InRepoCodeReview!');
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};