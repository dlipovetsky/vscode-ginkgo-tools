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

    children?: GinkgoNode[];
    parent?: GinkgoNode;
}

export interface Outline {
    nodes: GinkgoNode[];
}

// Sample outline. Note that `parent` is undefined for all nodes.
const sampleOutline = {
    nodes: [
        {
            "name": "Describe",
            "text": "NormalFixture",
            "start": 116,
            "end": 605,
            "spec": false,
            "focused": false,
            "pending": false,
            "children": [
                {
                    "name": "Describe",
                    "text": "normal",
                    "start": 152,
                    "end": 244,
                    "spec": false,
                    "focused": false,
                    "pending": false,
                    "children": [
                        {
                            "name": "It",
                            "text": "normal",
                            "start": 182,
                            "end": 240,
                            "spec": true,
                            "focused": false,
                            "pending": false,
                            "children": [
                                {
                                    "name": "By",
                                    "text": "step 1",
                                    "start": 207,
                                    "end": 219,
                                    "spec": false,
                                    "focused": false,
                                    "pending": false
                                },
                                {
                                    "name": "By",
                                    "text": "step 2",
                                    "start": 223,
                                    "end": 235,
                                    "spec": false,
                                    "focused": false,
                                    "pending": false
                                }
                            ]
                        }
                    ]
                },
                {
                    "name": "Context",
                    "text": "normal",
                    "start": 247,
                    "end": 307,
                    "spec": false,
                    "focused": false,
                    "pending": false,
                    "children": [
                        {
                            "name": "It",
                            "text": "normal",
                            "start": 276,
                            "end": 303,
                            "spec": true,
                            "focused": false,
                            "pending": false
                        }
                    ]
                },
                {
                    "name": "When",
                    "text": "normal",
                    "start": 310,
                    "end": 367,
                    "spec": false,
                    "focused": false,
                    "pending": false,
                    "children": [
                        {
                            "name": "It",
                            "text": "normal",
                            "start": 336,
                            "end": 363,
                            "spec": true,
                            "focused": false,
                            "pending": false
                        }
                    ]
                },
                {
                    "name": "It",
                    "text": "normal",
                    "start": 370,
                    "end": 396,
                    "spec": true,
                    "focused": false,
                    "pending": false
                },
                {
                    "name": "Specify",
                    "text": "normal",
                    "start": 399,
                    "end": 430,
                    "spec": true,
                    "focused": false,
                    "pending": false
                },
                {
                    "name": "Measure",
                    "text": "normal",
                    "start": 433,
                    "end": 480,
                    "spec": true,
                    "focused": false,
                    "pending": false
                },
                {
                    "name": "DescribeTable",
                    "text": "normal",
                    "start": 483,
                    "end": 541,
                    "spec": false,
                    "focused": false,
                    "pending": false,
                    "children": [
                        {
                            "name": "Entry",
                            "text": "normal",
                            "start": 522,
                            "end": 537,
                            "spec": true,
                            "focused": false,
                            "pending": false
                        }
                    ]
                },
                {
                    "name": "DescribeTable",
                    "text": "normal",
                    "start": 544,
                    "end": 602,
                    "spec": false,
                    "focused": false,
                    "pending": false,
                    "children": [
                        {
                            "name": "Entry",
                            "text": "normal",
                            "start": 583,
                            "end": 598,
                            "spec": true,
                            "focused": false,
                            "pending": false
                        }
                    ]
                }
            ]
        }
    ]
};

// outlineFromDocument returns the ginkgo outline for the TextDocument. It calls
// ginkgo as an external process.
export async function outlineFromDocument(doc: vscode.TextDocument): Promise<Outline | undefined> {
    return await new Promise<Outline | undefined>((resolve, reject) => { resolve(sampleOutline); });
}
