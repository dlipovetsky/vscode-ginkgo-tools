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

    nodes: GinkgoNode[];
    parent: GinkgoNode;
}

export interface Outline {
    nested: GinkgoNode[];
    flat: GinkgoNode[];
}

// fromDocument returns the ginkgo outline for the TextDocument. It calls ginkgo
// as an external process.
export async function fromDocument(doc: vscode.TextDocument): Promise<Outline> {
    try {
        // TODO const output: string = await callGingkoOutline();
        const output: string = `[{"name":"Describe","text":"NormalFixture","start":116,"end":605,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Describe","text":"normal","start":152,"end":244,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":182,"end":240,"spec":true,"focused":false,"pending":false,"nodes":[{"name":"By","text":"step 1","start":207,"end":219,"spec":false,"focused":false,"pending":false,"nodes":[]},{"name":"By","text":"step 2","start":223,"end":235,"spec":false,"focused":false,"pending":false,"nodes":[]}]}]},{"name":"Context","text":"normal","start":247,"end":307,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":276,"end":303,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"When","text":"normal","start":310,"end":367,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":336,"end":363,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"It","text":"normal","start":370,"end":396,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"Specify","text":"normal","start":399,"end":430,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"Measure","text":"normal","start":433,"end":480,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"DescribeTable","text":"normal","start":483,"end":541,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Entry","text":"normal","start":522,"end":537,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"DescribeTable","text":"normal","start":544,"end":602,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Entry","text":"normal","start":583,"end":598,"spec":true,"focused":false,"pending":false,"nodes":[]}]}]}] `;
        return fromJSON(output);
    } finally {

    }
}

export function fromJSON(input: string): Outline {
    const nested: GinkgoNode[] = JSON.parse(input);

    const flat: GinkgoNode[] = [];
    for (let n of nested) {
        preOrder(n, function (n: GinkgoNode) {
            // Construct the "flat" list of nodes
            flat.push(n);

            // Annotate every child with its parent
            for (let c of n.nodes) {
                c.parent = n;
            }
        });
    }

    return { nested, flat };
}

export function preOrder(node: GinkgoNode, f: Function): void {
    f(node);
    if (node.nodes) {
        for (let c of node.nodes) {
            preOrder(c, f);
        }
    }
}

