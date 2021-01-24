import * as vscode from 'vscode';
import * as outliner from './outliner';
import * as highlighter from './highlighter';

// doubleClickTimeMS is the maximum time, in mlliseconds, between two clicks
// that are interpreted as one "double click," as opposed to separate single
// clicks.
const doubleClickTimeMS: number = 300;
export class TreeDataProvider implements vscode.TreeDataProvider<outliner.GinkgoNode> {

    private _onDidChangeTreeData: vscode.EventEmitter<outliner.GinkgoNode | undefined> = new vscode.EventEmitter<outliner.GinkgoNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<outliner.GinkgoNode | undefined> = this._onDidChangeTreeData.event;

    private editor?: vscode.TextEditor;
    private roots: outliner.GinkgoNode[] = [];

    private lastClickedNode?: outliner.GinkgoNode;
    private lastClickedTime?: number;

    constructor(private context: vscode.ExtensionContext) {
        vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
        // vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
    }

    private onActiveEditorChanged(): void {
        this.editor = undefined;
        this.roots = [];
        this._onDidChangeTreeData.fire(undefined);
    }

    private async makeRoots() {
        this.editor = vscode.window.activeTextEditor;
        if (this.editor && this.editor.document) {
            try {
                const outline = await outliner.fromDocument(this.editor.document);
                this.roots = outline.nested;
            } catch (err) {
                // log error
            }
        }
    }

    async getChildren(element?: outliner.GinkgoNode | undefined): Promise<outliner.GinkgoNode[]> {
        if (this.roots.length === 0) {
            await this.makeRoots();
        }

        if (!element) {
            return this.roots;
        }
        return element.nodes;
    }

    getTreeItem(element: outliner.GinkgoNode): vscode.TreeItem {
        const label = `${element.name}: ${element.text}`;
        const collapsibleState: vscode.TreeItemCollapsibleState = element.nodes.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
        const treeItem = new vscode.TreeItem(label, collapsibleState);

        treeItem.command = {
            command: 'ginkgooutline.clickTreeItem',
            arguments: [element],
            title: ''
        };

        // treeItem.description

        // treeItem.iconPath

        treeItem.tooltip = new vscode.MarkdownString(`**name:** ${element.name}  \n
**text:** ${element.text}  \n
**start:** ${element.start}  \n
**end:** ${element.end}  \n
**spec:** ${element.spec}  \n
**focused:** ${element.focused}  \n
**pending:** ${element.pending}`, false);

        return treeItem;
    }

    // clickTreeItem is a workaround for the TreeView only supporting only one "click" command.
    // It is inspired by https://github.com/fernandoescolar/vscode-solution-explorer/blob/master/src/commands/OpenFileCommand.ts,
    // which was discovered in https://github.com/microsoft/vscode/issues/39601#issuecomment-376415352.
    clickTreeItem(element: outliner.GinkgoNode) {
        if (!this.editor) {
            return;
        }

        const now = Date.now();
        let recentlyClicked = false;
        if (this.lastClickedTime && this.lastClickedNode) {
            recentlyClicked = wasRecentlyClicked(this.lastClickedNode, this.lastClickedTime, element, now);
        }
        this.lastClickedTime = now;
        this.lastClickedNode = element;

        if (recentlyClicked) {
            highlighter.highlightOff(this.editor);
            const anchor = this.editor.document.positionAt(element.start);
            this.editor.selection = new vscode.Selection(anchor, anchor);
            vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
            return;
        }
        highlighter.highlightNode(this.editor, element);
    }

}

function wasRecentlyClicked(lastClickedNode: outliner.GinkgoNode, lastClickedTime: number, currentNode: outliner.GinkgoNode, currentTime: number): boolean {
    const isSameNode = lastClickedNode.start === currentNode.start && lastClickedNode.end === currentNode.end;
    const wasRecentlyClicked = (currentTime - lastClickedTime) < doubleClickTimeMS;
    return isSameNode && wasRecentlyClicked;
}
