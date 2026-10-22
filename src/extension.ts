// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "include-graph" is now active!');

	const disposable = vscode.commands.registerCommand('include-graph.showTree', () => {
		vscode.window.showInformationMessage('Showing Include Graph Tree');
	});

	context.subscriptions.push(disposable);
}


export function deactivate() {}