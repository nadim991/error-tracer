"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
function traceError(error, projectPath) {
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
function activate(context) {
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
                }
                catch (err) {
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
            }
            catch (err) {
                vscode.window.showErrorMessage('Failed to connect to backend. Is the server running?');
            }
        });
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map