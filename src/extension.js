const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let commentController;
let commentThreads = new Map();


function initializeCommentController() {
    commentController = vscode.comments.createCommentController(
        'inrepocodereview',
        'InRepo Code Review'
    );

    commentController.commentingRangeProvider = {
        provideCommentingRanges: (document, token) => {
            return [new vscode.Range(0, 0, document.lineCount - 1, 0)];
        }
    };

    commentController.options = {
        prompt: 'Add a code review comment...',
        placeHolder: 'Enter your review comment here'
    };
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

        // Initialize comment controller whenever Open Code Review is called
        if (!commentController) {
            initializeCommentController();
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create .codereview folder: ${error.message}`);
    }
}

async function createReview() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    // Initialize comment controller if not already initialized
    if (!commentController) {
        initializeCommentController();
    }

    const selection = editor.selection;
    const range = new vscode.Range(selection.start.line, 0, selection.end.line, editor.document.lineAt(selection.end.line).text.length);
    
    const thread = commentController.createCommentThread(editor.document.uri, range, []);
    thread.canReply = true;
    thread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
    thread.label = 'Code Review Comment';
    
    const threadId = Date.now().toString();
    commentThreads.set(threadId, thread);
}

async function setUserName() {
    const userName = await vscode.window.showInputBox({
        prompt: 'Enter your username for code review comments',
        placeHolder: 'Username',
        validateInput: (text) => {
            if (!text || text.trim().length === 0) {
                return 'Username cannot be empty';
            }
            return null;
        }
    });

    if (!userName) {
        return;
    }

    try {
        await vscode.workspace.getConfiguration('inrepocodereview').update('userName', userName.trim(), vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Username '${userName}' has been saved successfully!`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save username: ${error.message}`);
    }
}

function activate(context) {
    console.log('InRepoCodeReview extension is now active!');

    // Register commands
    const openReviewCommand = vscode.commands.registerCommand('inrepocodereview.openReview', async function () {
        await createCodeReviewFolder();
    });

    const createReviewCommand = vscode.commands.registerCommand('inrepocodereview.createReview', async function (reply) {
        await createReview(reply);
    });

    const setUserNameCommand = vscode.commands.registerCommand('inrepocodereview.setUserName', async function () {
        await setUserName();
    });

    context.subscriptions.push(openReviewCommand, createReviewCommand, setUserNameCommand);

    // Dispose comment controller on deactivation
    context.subscriptions.push({
        dispose: () => {
            if (commentController) {
                commentController.dispose();
            }
        }
    });
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};