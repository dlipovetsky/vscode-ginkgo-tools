import { timeStamp } from 'console';
import * as vscode from 'vscode';
import * as outliner from './outliner';

export class TreeDataProvider implements vscode.TreeDataProvider<outliner.GinkgoNode> {

    private editor?: vscode.TextEditor;
    private roots: outliner.GinkgoNode[] = [];

    constructor(private context: vscode.ExtensionContext) {
        // vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
        // vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
    }

    private async makeRoots() {
        this.editor = vscode.window.activeTextEditor;
        if (this.editor && this.editor.document) {
            const outline = await outliner.fromDocument(this.editor.document);
            this.roots = outline.nested;
        }
    }

    async getChildren(element?: outliner.GinkgoNode | undefined): Promise<outliner.GinkgoNode[]> {
        if (this.roots.length === 0) {
            try {
                await this.makeRoots();
            } catch {
                // log error
            }
        }

        if (!element) {
            return this.roots;
        }
        return element.nodes;
    }

    getTreeItem(element: outliner.GinkgoNode): vscode.TreeItem {
        const label = `${element.name}:${element.text}`;
        const collapsibleState: vscode.TreeItemCollapsibleState = element.nodes.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
        const treeItem = new vscode.TreeItem(label, collapsibleState);
        // treeItem.description
        // treeItem.iconPath
        // treeItem.command
        // treeItem.tooltip
        return treeItem;
    }

}