'use strict';

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
    const output: string = await callGinkgoOutline(doc);
    return fromJSON(output);
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
        const p = cp.execFile("/home/dlipovetsky/projects/ginkgo/ginkgo/ginkgo", ['outline', '--format=json', '-'], {}, (err, stdout, stderr) => {
            if (err) {
                return reject(`error running ginkgo outline (exit code ${err.code}): ${stderr}`);
            }
            const outline = stdout.toString();
            return resolve(outline);
        });
        if (!p.stdin) {
            return reject(`unable to write to stdin of ginkgo outline process: pipe does not exist`);
        }
        p.stdin.end(doc.getText());
    });
}