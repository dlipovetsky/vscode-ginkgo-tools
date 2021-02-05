'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import * as highlighter from './highlighter';
import * as decoration from './decoration';
import { outputChannel } from './extension';

class GinkgoNodeItem implements vscode.QuickPickItem {
    label = '';
    description = '';
    detail = '';

    constructor(readonly node: outliner.GinkgoNode) {
        const icon = decoration.iconForGinkgoNode(node);
        if (icon) {
            this.label += `$(${icon.id}) `;
        }
        this.label += decoration.labelForGinkgoNode(node);
    }
}

export async function fromTextEditor(editor: vscode.TextEditor, outlineFromDoc: { (doc: vscode.TextDocument): Promise<outliner.Outline> }) {
    if (editor.document.languageId !== 'go') {
        outputChannel.appendLine(`Did not populate Go To Symbol menu: document "${editor.document.uri}" language is not Go.`);
        void vscode.window.showQuickPick([]);
        return;
    }

    const out = await outlineFromDoc(editor.document);
    const picker = vscode.window.createQuickPick<GinkgoNodeItem>();
    const oldRange = (editor.visibleRanges.length > 0) ? editor.visibleRanges[0] : undefined;
    let didAcceptWithItem = false;
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
            const start = editor.document.positionAt(item.node.start);

            const acceptedSelection = new vscode.Selection(start, start);
            editor.selection = acceptedSelection;

            const newRange = new vscode.Range(acceptedSelection.start, acceptedSelection.end);
            editor.revealRange(newRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

            didAcceptWithItem = true;
        }
        picker.hide();
    });
    picker.onDidHide(() => {
        if (!didAcceptWithItem && oldRange) {
            editor.revealRange(oldRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        }
        highlighter.highlightOff(editor);
        picker.dispose();
    });
    picker.show();
}
