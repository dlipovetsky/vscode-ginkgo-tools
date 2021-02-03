'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import { outputChannel } from './extension';

interface CacheValue {
    docVersion: number,
    outline: outliner.Outline,
    timeout: NodeJS.Timeout,
}

export class CachingOutliner {

    private docToOutlineMap: Map<string, CacheValue> = new Map();

    constructor(private outliner: outliner.Outliner, private cacheTTL: number) { };

    public setOutliner(outliner: outliner.Outliner) {
        this.outliner = outliner;
        this.docToOutlineMap.clear();
    }

    public setCacheTTL(cacheTTL: number) {
        this.cacheTTL = cacheTTL;
        this.docToOutlineMap.clear();
    }

    public async fromDocument(doc: vscode.TextDocument): Promise<outliner.Outline> {
        const key = doc.uri.toString();
        let val = this.docToOutlineMap.get(key);
        if (!val || val.docVersion !== doc.version) {
            const outline = await this.outliner.fromDocument(doc);
            const handle = setTimeout(() => {
                try {
                    this.docToOutlineMap.delete(key);
                } catch (err) {
                    outputChannel.appendLine(`Could not evict outline for document $[key} from cache: ${err}`);
                }
            }, this.cacheTTL);

            val = { docVersion: doc.version, outline: outline, timeout: handle };
            this.docToOutlineMap.set(key, val);
        }
        return val.outline;
    }

}

