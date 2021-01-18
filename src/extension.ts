'use strict';

import * as vscode from 'vscode';
import * as symbolPicker from './symbolPicker';

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('ginkgooutline.GotoSymbolInEditor', () => {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		symbolPicker.fromTextEditor(vscode.window.activeTextEditor);
	});
}
