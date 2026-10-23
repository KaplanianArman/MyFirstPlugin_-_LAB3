import * as vscode from 'vscode';

export async function GetData(channel: vscode.OutputChannel): Promise<Map<string, string>> {
    const res = new Map<string, string>();

    const uris: vscode.Uri[] = await vscode.workspace.findFiles("**/*.{cpp,hpp,h}", 
                        "**/{node_modules,out,TRY,.git,build}/**");
    
    const decoder = new TextDecoder("utf-8");
    for (const uri of uris) {
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            const text: string = decoder.decode(bytes);
            res.set(uri.fsPath, text);
        } catch(e) {
            channel.appendLine(`ERROR: can't read ${uri.fsPath}`);
            channel.appendLine(String(e));
            channel.show();
        }
    }

    return res;
}