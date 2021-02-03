'use strict';

import * as vscode from 'vscode';
import { Outliner } from './outliner';
import { CachingOutliner } from './cachingOutliner';
import * as symbolPicker from './symbolPicker';
import * as treeDataProvider from './treeDataProvider';

const extensionName = 'ginkgooutline';
const displayName = 'Ginkgo Outline';

// These are used when a property key is missing from settings, or its value is invalid.
const defaultGinkgoPath = 'ginkgo';
const defaultUpdateOn = 'onType';
const defaultUpdateOnTypeDelay = 1000;
const defaultDoubleClickThreshold = 400;

export function getConfiguration(): vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration(extensionName);
}

export function affectsConfiguration(evt: vscode.ConfigurationChangeEvent, name: string): boolean {
	return evt.affectsConfiguration(`${extensionName}.${name}`);
}

export let outputChannel: vscode.OutputChannel;

export function activate(ctx: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel(displayName);
	ctx.subscriptions.push(outputChannel);
	outputChannel.appendLine('Activating Ginkgo Outline');

	const cachingOutliner = new CachingOutliner(new Outliner(getConfiguration().get('ginkgoPath', defaultGinkgoPath)), 1000 * 60 * 60);
	ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(evt => {
		if (affectsConfiguration(evt, 'ginkgoPath')) {
			cachingOutliner.setOutliner(new Outliner(getConfiguration().get('ginkgoPath', defaultGinkgoPath)));
		}
	}));

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

	const ginkgoTreeDataProvider = new treeDataProvider.TreeDataProvider(ctx, doc => cachingOutliner.fromDocument(doc), 'ginkgooutline.clickTreeItem',
		getConfiguration().get('updateOn', defaultUpdateOn),
		getConfiguration().get('updateOnTypeDelay', defaultUpdateOnTypeDelay),
		getConfiguration().get('doubleClickThreshold', defaultDoubleClickThreshold),
	);
	ctx.subscriptions.push(vscode.window.registerTreeDataProvider('ginkgooutline.views.outline', ginkgoTreeDataProvider));
	ctx.subscriptions.push(vscode.workspace.onDidChangeConfiguration(evt => {
		if (affectsConfiguration(evt, 'updateOn')) {
			ginkgoTreeDataProvider.setUpdateOn(getConfiguration().get('updateOn', defaultUpdateOn));
		}
		if (affectsConfiguration(evt, 'updateOnTypeDelay')) {
			ginkgoTreeDataProvider.setUpdateOnTypeDelay(getConfiguration().get('updateOnTypeDelay', defaultUpdateOnTypeDelay));
		}
		if (affectsConfiguration(evt, 'doubleClickThreshold')) {
			ginkgoTreeDataProvider.setDoubleClickThreshold(getConfiguration().get('doubleClickThreshold', defaultDoubleClickThreshold));
		}
	}));
}
