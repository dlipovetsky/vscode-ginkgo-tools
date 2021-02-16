'use strict';

import * as vscode from 'vscode';
import { GinkgoNode } from './outliner';

export class SpecExecutor {

    constructor(private ginkgoPath: string, private element: GinkgoNode, private testFileName: string) { };

    public executeTestSpec(terminal: vscode.Terminal | undefined, outputChannel: vscode.OutputChannel) {
        let specText = '';
        if (this.element.text !== '') {
            specText = getFullSpecText(this.element);
        }

        if (specText !== '') {
            if (terminal) {
                const fileNameSplited = this.testFileName.split('/');
                fileNameSplited.pop();
                const folderPath = fileNameSplited.join('/');
                terminal.sendText(`${this.ginkgoPath} -focus "${specText}" -r "${folderPath}"`, true);
            } else {
                outputChannel.appendLine("Terminal is not opened, so we can't run the gingko test command");
            }
        }
    }
}

export function getFullSpecText(element: GinkgoNode): string {
    let specText = '';
    if (element.name.includes('When')) {
        specText = 'when ' + element.text;
    } else {
        specText = element.text;
    }

    if (element.parent) {
        return getFullSpecText(element.parent) + ' ' + specText;
    }

    return specText;
}