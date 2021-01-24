import * as vscode from 'vscode';
import * as cp from 'child_process';
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
        // const output: string = `[{"name":"Describe","text":"NormalFixture","start":115,"end":604,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Describe","text":"normal","start":151,"end":243,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":181,"end":239,"spec":true,"focused":false,"pending":false,"nodes":[{"name":"By","text":"step 1","start":206,"end":218,"spec":false,"focused":false,"pending":false,"nodes":[]},{"name":"By","text":"step 2","start":222,"end":234,"spec":false,"focused":false,"pending":false,"nodes":[]}]}]},{"name":"Context","text":"normal","start":246,"end":306,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":275,"end":302,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"When","text":"normal","start":309,"end":366,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"It","text":"normal","start":335,"end":362,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"It","text":"normal","start":369,"end":395,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"Specify","text":"normal","start":398,"end":429,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"Measure","text":"normal","start":432,"end":479,"spec":true,"focused":false,"pending":false,"nodes":[]},{"name":"DescribeTable","text":"normal","start":482,"end":540,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Entry","text":"normal","start":521,"end":536,"spec":true,"focused":false,"pending":false,"nodes":[]}]},{"name":"DescribeTable","text":"normal","start":543,"end":601,"spec":false,"focused":false,"pending":false,"nodes":[{"name":"Entry","text":"normal","start":582,"end":597,"spec":true,"focused":false,"pending":false,"nodes":[]}]}]}]`;
        const output: string = await callGinkgoOutline(doc);
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

async function callGinkgoOutline(doc: vscode.TextDocument): Promise<string> {
    return new Promise(function (resolve, reject) {
        let p: cp.ChildProcess;
        p = cp.execFile("/home/dlipovetsky/projects/ginkgo/ginkgo/ginkgo", ['outline', '--format=json', '-'], {}, (err, stdout, stderr) => {
            try {
                if (err) {
                    return reject(`error starting ginkgo outline: ${err}`);
                }
                const outline = stdout.toString();
                return resolve(outline);
            } catch (e) {
                reject(`error running ginkgo outline: ${e}`);
            }
        });
        if (!p.stdin) {
            return reject(`unable to write to stdin of ginkgo outline process: pipe does not exist`);
        }
        p.stdin.end(doc.getText());
    });
}