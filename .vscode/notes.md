# Components

- Outliner: This runs `ginkgo outline` and caches the outline for the file. The outline gets updated whenever the file contents change in the editor (The on disk data is not relevant, because the outline should be consistent with whatever the editor shows).

- QuickPicker: This populates a QuickPick dropdown menu with symbols.
- TreeDataProvider: This populates a TreeView with symbols.

# Roadmap

- [x] Skeleton
- [x] Define data model
- [x] Deserialize ginkgo outline output into flat and nested representation
- [ ] Call `ginkgo outline` with current doc
- [ ] Implement symbol selector using the flat representation
- [ ] Implement static Outline view using the nested representation
- [ ] Implement auto-refreshing Outline view (refresh whenever doc.onDidChangeTextDocument event fires)
- [ ] Implement "cachedOutliner" that only calls `ginkgo` if there is no outline cached for the doc.version. Evict when doc closes or changes. See https://github.com/microsoft/vscode/blob/98106c48a07d4d07f0f71b4db9b3ff156f223339/src/vs/workbench/contrib/timeline/browser/timelinePane.ts#L77)
