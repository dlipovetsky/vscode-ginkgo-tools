# Components

- Outliner: This runs `ginkgo outline` and caches the outline for the file. The outline gets updated whenever the file contents change in the editor (The on disk data is not relevant, because the outline should be consistent with whatever the editor shows).

- QuickPicker: This populates a QuickPick dropdown menu with symbols.
- TreeDataProvider: This populates a TreeView with symbols.

# Roadmap

- [ ] Skeleton
- [ ] Define data model
- [ ] Map data to treeview
- [ ] Unit test
- [ ] Exec command async
- [ ] Integration test
- [ ] Refresh whenever file content changes (with or without saving to disk)
- [ ] Cache results (see https://github.com/microsoft/vscode/blob/98106c48a07d4d07f0f71b4db9b3ff156f223339/src/vs/workbench/contrib/timeline/browser/timelinePane.ts#L77)
