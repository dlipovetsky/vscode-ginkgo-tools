'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';

const symbolHighlightDecorationType = vscode.window.createTextEditorDecorationType({
    light: {
        backgroundColor: { id: 'editor.selectionHighlightBackground' },
    },
    dark: {
        backgroundColor: { id: 'editor.selectionHighlightBackground' },
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: { id: 'contrastActiveBorder' }
    },
});

export function highlightNode(editor: vscode.TextEditor, node: outliner.GinkgoNode) {
    if (editor.document.isClosed) {
        return;
    }
    const range = rangeFromNode(editor.document, node);
    editor.revealRange(range);
    editor.setDecorations(symbolHighlightDecorationType, [range]);
}

export function highlightOff(editor: vscode.TextEditor) {
    editor.setDecorations(symbolHighlightDecorationType, []);
}

function rangeFromNode(document: vscode.TextDocument, node: outliner. GinkgoNode): vscode.Range {
    const start = document.positionAt(node.start);
    const end = document.positionAt(node.end);
    return new vscode.Range(start, end);
}
