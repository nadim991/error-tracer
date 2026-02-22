
import * as vscode from 'vscode';
import * as http from 'http';

function traceError(error: string, projectPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ error, project_path: projectPath });
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: '/trace',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const result = JSON.parse(body);
                resolve(result.result);
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('error-tracer.trace', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor!');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);
       if (!selectedText) {
    // Use entire document if nothing selected
    const fullText = editor.document.getText();
    if (!fullText) {
        vscode.window.showErrorMessage('No text found!');
        return;
    }
    const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Tracing error root cause...',
        cancellable: false
    }, async () => {
        try {
            const result = await traceError(fullText, projectPath);
            const doc = await vscode.workspace.openTextDocument({
                content: result,
                language: 'markdown'
            });
            vscode.window.showTextDocument(doc);
        } catch (err) {
            vscode.window.showErrorMessage('Failed to connect to backend. Is the server running?');
        }
    });
    return;
}

        const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Tracing error root cause...',
            cancellable: false
        }, async () => {
            try {
                const result = await traceError(selectedText, projectPath);
                const doc = await vscode.workspace.openTextDocument({
                    content: result,
                    language: 'markdown'
                });
                vscode.window.showTextDocument(doc);
            } catch (err) {
                vscode.window.showErrorMessage('Failed to connect to backend. Is the server running?');
            }
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
