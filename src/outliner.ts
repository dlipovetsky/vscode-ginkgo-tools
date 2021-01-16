import * as vscode from 'vscode';

export interface GinkgoNode {
    // Metadata
    // Keep in sync with https://github.com/onsi/ginkgo/tree/master/ginkgo/outline
    name: string;
    text: string;
    start: number;
    end: number;
    spec: boolean;
    focused: boolean;
    pending: boolean;

    nodes?: GinkgoNode[];
    parent?: GinkgoNode;
}

export interface Outline {
    tree: GinkgoNode;
    list: GinkgoNode[];
}

// fromDocument returns the ginkgo outline for the TextDocument. It calls ginkgo
// as an external process.
export async function fromDocument(doc: vscode.TextDocument): Promise<Outline> {
    try {
        // TODO const output: string = await callGingkoOutline();
        const output: string = '';
        return fromJSON(output);
    } finally {

    }
}

export function fromJSON(input: string): Outline {
    const nodes: GinkgoNode[] = JSON.parse(input);
    const root = {
        name: '',
        text: '',
        start: 0,
        end: 0,
        spec: false,
        focused: false,
        pending: false,

        nodes: nodes,
        parent: undefined,
    };

    const list: GinkgoNode[] = [];
    preOrder(root, function (n: GinkgoNode) {
        // Construct the "flat" list of nodes
        list.push(n);

        // Annotate every child with its parent
        if (n.nodes) {
            for (let c of n.nodes) {
                c.parent = n;
            }
        }
    });

    return {
        tree: root,
        list: list
    };
}

function preOrder(node: GinkgoNode, f: Function): void {
    f(node);
    if (node.nodes) {
        for (let c of node.nodes) {
            preOrder(c, f);
        }
    }
}

