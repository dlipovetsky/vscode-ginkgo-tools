'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import * as highlighter from './highlighter';
import * as decoration from './decoration';
import { outputChannel } from './extension';

type UpdateOn = 'onSave' | 'onType';
export class TreeDataProvider implements vscode.TreeDataProvider<outliner.GinkgoNode> {

    private readonly _onDidChangeTreeData: vscode.EventEmitter<outliner.GinkgoNode | undefined> = new vscode.EventEmitter<outliner.GinkgoNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<outliner.GinkgoNode | undefined> = this._onDidChangeTreeData.event;

    private updateListener?: vscode.Disposable;

    private editor?: vscode.TextEditor;
    private roots: outliner.GinkgoNode[] = [];

    private lastClickedNode?: outliner.GinkgoNode;
    private lastClickedTime?: number;

    private documentChangedTimer?: NodeJS.Timeout;

    constructor(private readonly ctx: vscode.ExtensionContext, private readonly outlineFromDoc: { (doc: vscode.TextDocument): Promise<outliner.Outline> }, private readonly clickTreeItemCommand: string, private updateOn: UpdateOn, private updateOnTypeDelay: number, private doubleClickThreshold: number) {
        ctx.subscriptions.push(vscode.commands.registerCommand(this.clickTreeItemCommand, async (node) => this.clickTreeItem(node)));
        ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(evt => this.onActiveEditorChanged(evt)));
        this.editor = vscode.window.activeTextEditor;
        this.setUpdateOn(this.updateOn);
        this.setUpdateOnTypeDelay(this.updateOnTypeDelay);
    }

    public setUpdateOn(updateOn: UpdateOn) {
        if (this.updateListener) {
            this.updateListener.dispose();
        }
        switch (updateOn) {
            case 'onType':
                this.updateListener = vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this, this.ctx.subscriptions);
                break;
            case 'onSave':
                this.updateListener = vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved, this, this.ctx.subscriptions);
                break;
        }
    }

    public setUpdateOnTypeDelay(updateOnTypeDelay: number) {
        this.updateOnTypeDelay = Math.min(updateOnTypeDelay, 0);
    }

    public setDoubleClickThreshold(doubleClickThreshold: number) {
        this.doubleClickThreshold = Math.min(doubleClickThreshold, 0);
    }

    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        this.editor = editor;
        this.roots = [];
        this._onDidChangeTreeData.fire(undefined);
    }

    private isDocumentForActiveEditor(doc: vscode.TextDocument): boolean {
        if (!this.editor) {
            return false;
        }
        return this.editor.document.uri.toString() === doc.uri.toString();
    }

    private onDocumentChanged(evt: vscode.TextDocumentChangeEvent): void {
        if (!this.isDocumentForActiveEditor(evt.document)) {
            return;
        }
        if (evt.contentChanges.length === 0) {
            return;
        }
        this.roots = [];
        if (this.documentChangedTimer) {
            clearTimeout(this.documentChangedTimer);
            this.documentChangedTimer = undefined;
        }
        this.documentChangedTimer = setTimeout(() => this._onDidChangeTreeData.fire(undefined), this.updateOnTypeDelay);
    }

    private onDocumentSaved(doc: vscode.TextDocument): void {
        if (!this.isDocumentForActiveEditor(doc)) {
            return;
        }
        this.roots = [];
        this._onDidChangeTreeData.fire(undefined);
    }

    async getChildren(element?: outliner.GinkgoNode | undefined): Promise<outliner.GinkgoNode[]> {
        if (!this.editor) {
            return [];
        }
        if (this.editor.document.languageId !== 'go') {
            outputChannel.appendLine(`Did not populate outline view: document "${this.editor.document.uri}" language is not Go.`);
            return [];
        }
        if (this.roots.length === 0) {
            try {
                const outline = await this.outlineFromDoc(this.editor.document);
                this.roots = outline.nested;
            } catch (err) {
                outputChannel.appendLine(`Could not populate the outline view: ${err}`);
                void vscode.window.showErrorMessage('Could not populate the outline view', ...['Open Log']).then(action => {
                    if (action === 'Open Log') {
                        outputChannel.show();
                    }
                });
                return [];
            }
        }

        if (!element) {
            return this.roots;
        }
        return element.nodes;
    }

    getTreeItem(element: outliner.GinkgoNode): vscode.TreeItem {
        const label = decoration.labelForGinkgoNode(element);
        const collapsibleState: vscode.TreeItemCollapsibleState = element.nodes.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
        const treeItem = new vscode.TreeItem(label, collapsibleState);
        treeItem.iconPath = decoration.iconForGinkgoNode(element);
        treeItem.tooltip = tooltipForGinkgoNode(element);
        treeItem.command = {
            command: this.clickTreeItemCommand,
            arguments: [element],
            title: ''
        };
        return treeItem;
    }

    // clickTreeItem is a workaround for the TreeView only supporting only one "click" command.
    // It is inspired by https://github.com/fernandoescolar/vscode-solution-explorer/blob/master/src/commands/OpenFileCommand.ts,
    // which was discovered in https://github.com/microsoft/vscode/issues/39601#issuecomment-376415352.
    async clickTreeItem(element: outliner.GinkgoNode) {
        if (!this.editor) {
            return;
        }

        const now = Date.now();
        let recentlyClicked = false;
        if (this.lastClickedTime && this.lastClickedNode) {
            recentlyClicked = wasRecentlyClicked(this.doubleClickThreshold, this.lastClickedNode, this.lastClickedTime, element, now);
        }
        this.lastClickedTime = now;
        this.lastClickedNode = element;

        if (recentlyClicked) {
            highlighter.highlightOff(this.editor);
            const anchor = this.editor.document.positionAt(element.start);
            this.editor.selection = new vscode.Selection(anchor, anchor);
            await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
            return;
        }
        highlighter.highlightNode(this.editor, element);
    }

}

function wasRecentlyClicked(threshold: number, lastClickedNode: outliner.GinkgoNode, lastClickedTime: number, currentNode: outliner.GinkgoNode, currentTime: number): boolean {
    const isSameNode = lastClickedNode.start === currentNode.start && lastClickedNode.end === currentNode.end;
    const wasRecentlyClicked = (currentTime - lastClickedTime) < threshold;
    return isSameNode && wasRecentlyClicked;
}

function tooltipForGinkgoNode(element: outliner.GinkgoNode): vscode.MarkdownString {
    return new vscode.MarkdownString(`**name:** ${element.name}  \n
**text:** ${element.text}  \n
**start:** ${element.start}  \n
**end:** ${element.end}  \n
**spec:** ${element.spec}  \n
**focused:** ${element.focused}  \n
**pending:** ${element.pending}`, false);
}