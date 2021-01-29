'use strict';

import * as vscode from 'vscode';
import * as outliner from './outliner';
import { CachingOutliner } from './cachingOutliner';
import * as symbolPicker from './symbolPicker';
import * as treeDataProvider from './treeDataProvider';

const displayName = 'Ginkgo Outline';

export let outputChannel: vscode.OutputChannel;

export function activate(ctx: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel(displayName);
	ctx.subscriptions.push(outputChannel);

	outputChannel.appendLine('Activating Ginkgo Outline');

	const cachingOutliner = new CachingOutliner(outliner.fromDocument, 1000 * 60 * 60);

	ctx.subscriptions.push(vscode.commands.registerCommand('ginkgooutline.GotoSymbolInEditor', async () => {
		if (!vscode.window.activeTextEditor) {
			outputChannel.appendLine('Cancelled QuickPick menu: no active text editor');
			return;
		}
		try {
			await symbolPicker.fromTextEditor(vscode.window.activeTextEditor, doc => cachingOutliner.fromDocument(doc));
		} catch (err) {
			outputChannel.appendLine(`Could not create a QuickPick menu: ${err}`);
			const action = await vscode.window.showErrorMessage('Could not create a QuickPick menu', ...['Open Log']);
			if (action === 'Open Log') {
				outputChannel.show();
			}
		}
	}));

	const ginkgoTreeDataProvider = new treeDataProvider.TreeDataProvider(doc => cachingOutliner.fromDocument(doc), 'ginkgooutline.clickTreeItem');
	ctx.subscriptions.push(vscode.window.registerTreeDataProvider('ginkgooutline.views.outline', ginkgoTreeDataProvider));
}
