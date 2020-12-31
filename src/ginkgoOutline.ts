import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


// Keep in sync with https://github.com/onsi/ginkgo/tree/master/ginkgo/outline
export interface GinkgoNode {
    // Metadata
    name: string;
    text: string;
    start: number,
    end: number,
    spec: boolean,
    focused: boolean,
    pending: boolean,
    // Descendant nodes
    nodes: GinkgoNode[];
}

export class GinkgoOutlineProvider implements vscode.TreeDataProvider<GinkgoNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<GinkgoNode | undefined | void> = new vscode.EventEmitter<GinkgoNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<GinkgoNode | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: GinkgoNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GinkgoNode): Thenable<GinkgoNode[]> {
        return Promise.resolve([]);
    }

}

export class GinkgoNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private readonly version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);

        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'ginkgonode.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'ginkgonode.svg')
    // };

    contextValue = 'ginkgonode';
}
