'use strict';

import * as vscode from 'vscode';

import { GinkgoOutlineProvider } from './ginkgoOutline';

export function activate(context: vscode.ExtensionContext) {

	const ginkgoOutlineProvider = new GinkgoOutlineProvider(context);
	vscode.window.registerTreeDataProvider('ginkgoOutline', ginkgoOutlineProvider);
}
