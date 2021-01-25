import * as vscode from 'vscode';
import * as outliner from './outliner';

interface CacheValue {
    docVersion: number,
    outline: outliner.Outline,
    timeout: NodeJS.Timeout,
}

export class CachingOutliner {

    private readonly docToOutlineMap: Map<string, CacheValue> = new Map();

    constructor(private readonly outlineFromDoc: { (doc: vscode.TextDocument): Promise<outliner.Outline> }, private readonly ttlMs: number) { };

    public async fromDocument(doc: vscode.TextDocument): Promise<outliner.Outline> {
        const key = doc.uri.toString();
        let val = this.docToOutlineMap.get(key);
        if (!val || val.docVersion !== doc.version) {
            const outline = await this.outlineFromDoc(doc);
            const handle = setTimeout(() => {
                try {
                    this.docToOutlineMap.delete(key);
                } catch (err) {
                    // TODO log to output channel
                }
            }, this.ttlMs);

            val = { docVersion: doc.version, outline: outline, timeout: handle };
            this.docToOutlineMap.set(key, val);
        }
        return val.outline;
    }

}

