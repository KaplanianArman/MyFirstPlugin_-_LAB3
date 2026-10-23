import * as vscode from 'vscode';
import * as path from 'path'
import { GraphOfDependencies } from './graph';

export class NodeFile extends vscode.TreeItem {
    readonly absolute_path: string;
    readonly ancestors: readonly string[];

    constructor(absolute_path: string, ancestors: readonly string[],
                root: string, is_cycle: boolean, has_children: boolean) {
        
        if (!is_cycle && has_children) {
            super(path.basename(absolute_path), vscode.TreeItemCollapsibleState.Collapsed);
        } else {
            super(path.basename(absolute_path), vscode.TreeItemCollapsibleState.None);
        }

        this.absolute_path = absolute_path;
        this.ancestors = ancestors;
        this.id = [...ancestors, absolute_path].join('/');
        this.resourceUri = vscode.Uri.file(absolute_path);
        this.description = path.relative(root, absolute_path);
        if (is_cycle) {
            this.description += " (cycle)";
        }

        this.command = {command: "vscode.open",
                        title: "opens file",
                        arguments: [vscode.Uri.file(absolute_path)]
        };
    }
}

export class FileProvider implements vscode.TreeDataProvider<NodeFile> {
    private root: string = "";
    private graph: GraphOfDependencies | undefined = undefined;

    private emitter = new vscode.EventEmitter<NodeFile | undefined | void>();
    readonly onDidChangeTreeData = this.emitter.event;

    getTreeItem(node: NodeFile): vscode.TreeItem {
        return node;
    }

    setData(root: string, graph: GraphOfDependencies): void {
        this.root = root;
        this.graph = graph;
        this.emitter.fire(undefined);
    }

    makeNode(path: string, ancestors: readonly string[]): NodeFile {
        let is_cycle: boolean = false;
        let has_children: boolean = false;
        if (ancestors.includes(path)) {
            is_cycle = true;
        }

        const depends = this.graph?.include.get(path);
        if (depends !== undefined && depends.size !== 0) {
            has_children = true;
        }

        return new NodeFile(path, ancestors, this.root, is_cycle, has_children);
    }

    getChildren (file?: NodeFile): NodeFile[] {
        if (this.graph === undefined) {
            return [];
        }

        if (file === undefined) {
            const arr: string[] = Array.from(this.graph.include.keys()).sort();
            return arr.map(el => this.makeNode(el, []));
        }

        const dependencies = this.graph.include.get(file.absolute_path);

        if (dependencies === undefined) {
            return [];
        }

        const ancestors: string[] = [...file.ancestors, file.absolute_path];
        const arr = Array.from(dependencies).sort();

        return arr.map(el => this.makeNode(el, ancestors));
    }
}