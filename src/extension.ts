import * as vscode from 'vscode';
import { GetData } from './workspace';
import { BuildGraph, GraphOfDependencies } from './graph';
import { FileProvider } from './tree-provider';

export function activate(context: vscode.ExtensionContext) {

	const channel = vscode.window.createOutputChannel("Include Graph");
	const provider = new FileProvider();

	const rebuild = async function(): Promise<void> {
		try {
			const folders = vscode.workspace.workspaceFolders;

			if (folders === undefined || folders.length === 0) {
				channel.appendLine("Open folder with your project");
				return;
			}

			const root = folders[0].uri.fsPath;

			channel.clear();
			const data: Map<string, string> = await GetData(channel);
			
			const graph: GraphOfDependencies = BuildGraph(data, root);

			provider.setData(root, graph);

			channel.appendLine(`Downloaded ${data.size} files`);
			channel.appendLine(`Entries in include = ${graph.include.size}`);
			channel.appendLine(`Entries in included_by = ${graph.included_by.size}`);

			let sz_include: number = 0;
			let sz_included_by: number = 0;

			for (const el of graph.include.values()) {
				sz_include += el.size;
			}

			for (const el of graph.included_by.values()) {
				sz_included_by += el.size;
			}

			channel.appendLine(`Links in include = ${sz_include}`);
			channel.appendLine(`Links in included_by = ${sz_included_by}`);
		} catch(e) {
			vscode.window.showErrorMessage(String(e));
		}
	};

	const disposable = vscode.commands.registerCommand('include-graph.refresh', async () => {
		await rebuild();
		channel.show();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(channel);
	context.subscriptions.push(vscode.window.registerTreeDataProvider('includeGraph.tree', provider));
	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => rebuild()));

	rebuild();
}

export function deactivate() {}