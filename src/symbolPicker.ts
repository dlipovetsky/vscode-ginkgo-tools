'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import * as highlighter from './highlighter';

class GinkgoNodeItem implements vscode.QuickPickItem {
    label: string;
    description = '';
    detail = '';
    node: outliner.GinkgoNode;

    constructor(public n: outliner.GinkgoNode) {
        // TODO: Prefix a "theme icon" to the label. Choose icon based on node.name (Describe, Context, It, etc).
        this.label = `${n.name}: ${n.text}`;
        this.node = n;
    }
}

export async function fromTextEditor(editor: vscode.TextEditor, outlineFromDoc: { (doc: vscode.TextDocument): Promise<outliner.Outline> }) {
    const out = await outlineFromDoc(editor.document);

    const picker = vscode.window.createQuickPick<GinkgoNodeItem>();
    picker.placeholder = 'Go to Ginkgo spec or container';
    picker.items = out.flat.map(n => new GinkgoNodeItem(n));
    picker.onDidChangeActive(selection => {
        if (!selection[0]) {
            return;
        }
        highlighter.highlightNode(editor, selection[0].node);
    });
    picker.onDidAccept(() => {
        const item = picker.selectedItems[0];
        if (item) {
            highlighter.highlightOff(editor);
            const anchor = editor.document.positionAt(item.node.start);
            editor.selection = new vscode.Selection(anchor, anchor);
        }
        picker.dispose();
    });
    picker.onDidHide(() => {
        highlighter.highlightOff(editor);
        picker.dispose();
    });
    picker.show();
}
