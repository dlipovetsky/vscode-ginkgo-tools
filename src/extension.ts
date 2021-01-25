'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import { CachingOutliner } from './cachingOutliner';
import * as symbolPicker from './symbolPicker';
import * as treeDataProvider from './treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	const cachingOutliner = new CachingOutliner(outliner.fromDocument);

	vscode.commands.registerCommand('ginkgooutline.GotoSymbolInEditor', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		symbolPicker.fromTextEditor(vscode.window.activeTextEditor, doc => cachingOutliner.fromDocument(doc));
	});

	const ginkgoTreeDataProvider = new treeDataProvider.TreeDataProvider(doc => cachingOutliner.fromDocument(doc));
	vscode.window.registerTreeDataProvider('ginkgooutline.views.outline', ginkgoTreeDataProvider);
	vscode.commands.registerCommand('ginkgooutline.clickTreeItem', node => ginkgoTreeDataProvider.clickTreeItem(node));
}
