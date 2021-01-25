import * as vscode from 'vscode';
import * as outliner from './outliner';

export class CachingOutliner {

    private readonly docToOutlineMap: Map<string, outliner.Outline> = new Map();

    constructor(private readonly outlineFromDoc: { (doc: vscode.TextDocument): Promise<outliner.Outline> }) { };

    public async fromDocument(doc: vscode.TextDocument): Promise<outliner.Outline> {
        const key = this.keyForDoc(doc);
        const cachedVal = this.docToOutlineMap.get(key);
        if (!cachedVal) {
            const val = await this.outlineFromDoc(doc);
            this.docToOutlineMap.set(key, val);
            return val;
        }
        return cachedVal;
    }

    private keyForDoc(doc: vscode.TextDocument): string {
        return `${doc.uri.toString()},${doc.version}`;
    }

}

