'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import { CachingOutliner } from './cachingOutliner';
import * as symbolPicker from './symbolPicker';
import * as treeDataProvider from './treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	const cachingOutliner = new CachingOutliner(outliner.fromDocument, 1000 * 60 * 60);

	vscode.commands.registerCommand('ginkgooutline.GotoSymbolInEditor', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		try {
			symbolPicker.fromTextEditor(vscode.window.activeTextEditor, doc => cachingOutliner.fromDocument(doc));
		} catch (err) {
			// log
		}
	});

	const ginkgoTreeDataProvider = new treeDataProvider.TreeDataProvider(doc => cachingOutliner.fromDocument(doc), 'ginkgooutline.clickTreeItem');
	vscode.window.registerTreeDataProvider('ginkgooutline.views.outline', ginkgoTreeDataProvider);
}
