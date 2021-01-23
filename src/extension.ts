'use strict';

import * as vscode from 'vscode';
import * as symbolPicker from './symbolPicker';
import * as treeDataProvider from './treeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('ginkgooutline.GotoSymbolInEditor', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		symbolPicker.fromTextEditor(vscode.window.activeTextEditor);
	});

	const ginkgoTreeDataProvider = new treeDataProvider.TreeDataProvider(context);
	vscode.window.registerTreeDataProvider('ginkgooutline.views.outline', ginkgoTreeDataProvider);
}
