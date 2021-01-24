# Components

- Outliner: This runs `ginkgo outline` and caches the outline for the file. The outline gets updated whenever the file contents change in the editor (The on disk data is not relevant, because the outline should be consistent with whatever the editor shows).

- QuickPicker: This populates a QuickPick dropdown menu with symbols.
- TreeDataProvider: This populates a TreeView with symbols.

# Roadmap

- [x] Skeleton
- [x] Define data model
- [x] Deserialize ginkgo outline output into flat and nested representation
- [x] Implement symbol selector using the flat representation
- [x] Implement static Outline view using the nested representation
- [x] Call `ginkgo outline` with current doc
- [x] Implement auto-refreshing Outline view (refresh whenever doc.onDidChangeTextDocument event fires)
- [ ] Review error handling. Log errors where needed.
- [ ] Make auto-refresh and double-click configuration options.
- [ ] Implement "cachedOutliner" that only calls `ginkgo` if there is no outline cached for the doc.version. Evict when doc closes or changes. See https://github.com/microsoft/vscode/blob/98106c48a07d4d07f0f71b4db9b3ff156f223339/src/vs/workbench/contrib/timeline/browser/timelinePane.ts#L77)


# Notes

- When 'contributes.viewContainers.panel' support was added, it doesn't support extension-qualified identifiers, e.g. 'myextension.panel',
  because of the regex pattern required here:
  https://github.com/microsoft/vscode/blame/686cd7df530fc4d294b9580339cb8e3e3169156c/src/vs/workbench/api/browser/viewsExtensionPoint.ts#L68
  that was added to fix this problem https://github.com/microsoft/vscode/issues/48563.
  For some reason, 'contributes.views' does not require that regex pattern.
