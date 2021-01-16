import * as vscode from 'vscode';
import * as outliner from './outliner';

class GinkgoNodeItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    detail = '';

    constructor(public node: outliner.GinkgoNode) {
        // TODO: Prefix a "theme icon" to the label. Choose icon based on node.name (Describe, Context, It, etc).
        this.label = node.text;
        this.description = node.name;
    }
}

export async function fromDocument() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    if (!editor.document) {
        return;
    }
    try {
        const node = await new Promise<outliner.GinkgoNode | undefined>((resolve, reject) => {
            const picker = vscode.window.createQuickPick<GinkgoNodeItem>();
            picker.placeholder = 'Go to ginkgo node';

            const out = outliner.fromDocument(editor.document);


            picker.show();
        });
        if (!node) {
            return;
        }
        const pos = editor.document.positionAt(node.start);
        editor.selection = new vscode.Selection(pos, pos);
    } finally {
        // handle rejected promise
    }
}
