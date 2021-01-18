import * as vscode from 'vscode';
import * as outliner from './outliner';

class GinkgoNodeItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    detail = '';
    node: outliner.GinkgoNode;

    constructor(public n: outliner.GinkgoNode) {
        // TODO: Prefix a "theme icon" to the label. Choose icon based on node.name (Describe, Context, It, etc).
        this.label = n.text;
        this.description = n.name;
        this.node = n;
    }
}

export async function fromTextEditor(editor: vscode.TextEditor) {
    try {
        const out = await outliner.fromDocument(editor.document);

        // TODO: use showQuickPick instead
        const picker = vscode.window.createQuickPick<GinkgoNodeItem>();
        picker.placeholder = 'Go to ginkgo node';
        picker.items = out.flat.map(n => new GinkgoNodeItem(n));
        picker.onDidChangeActive(selection => {
            if (!selection[0]) {
                return;
            }
            const anchor = editor.document.positionAt(selection[0].node.start);
            const active =  editor.document.positionAt(selection[0].node.end);
            editor.selection = new vscode.Selection(anchor, active);
        });
        picker.onDidAccept(() => {
            if(!picker.selectedItems[0]) {
                return;
            }
            const anchor = editor.document.positionAt(picker.selectedItems[0].node.start);
            editor.selection = new vscode.Selection(anchor, anchor);

            picker.dispose();
        });
        picker.onDidHide(() => picker.dispose());
        picker.show();
    } finally {
        // handle rejected promise
    }
}
