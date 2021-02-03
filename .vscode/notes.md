# Notes

## Alternatives

### Why not implement a DocumentSymbolProvider?

https://code.visualstudio.com/api/references/vscode-api#DocumentSymbolProvider

It's possible to implement a DocumentSymbolProvider for GInkgo, and register
it to work with Go languuage files. It would work alongside the vscode-go
DocumentSymbolProvider implementation.

The Outline view would get a tree with Ginkgo symbols, next to tree with Go
symbols. See screenshot in https://github.com/Microsoft/vscode/issues/60641.

However, the Outline view wouldn't support features like running a test, or
storing the outcome of the last run.

Finally, Ginkgo is a test framework, and it seems to best map to the Test
view on the activity bar.

### Why not implement a client + server for Language Server Protocol (LSP)?

https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

VSCode requires a document to have exactly one language. So a document
couldn't both be identified as Go and Ginkgo. A feature request to handle
HTML embedded in PHP came up:
https://github.com/microsoft/vscode/issues/2915. The answer was: please
change the PHP language server delegate to the HTML language server
internally. From this, I assume that the Go language server would have to
delegate to the Ginkgo language server, and I doubt that would get merged.
## Components

- Outliner: This runs `ginkgo outline` and caches the outline for the file. The
  outline gets updated whenever the file contents change in the editor (The on
  disk data is not relevant, because the outline should be consistent with
  whatever the editor shows).
- CachingOutliner: This caches outlines for a document version. Entries are
  evicted after a timeout.
- QuickPicker: This populates a QuickPick dropdown menu with symbols.
- TreeDataProvider: This populates a TreeView with symbols.

## Known Issues

- The outline auto-refresh is very eager; changing a single character triggers
  an update, invalidates the cache entry because the doc version increases, and
  causes ginkgo outline to be called. Not sure how best to address this. Options:
    - Auto-refresh on save only
    - Implement a rate-limiting Outliner. If the rate limit is exceeded, return an empty outline.
    - Cancellation tokens are _not_ supported, except for resolveTreeItem, which is only for tooltips

## Roadmap

- [x] Skeleton
- [x] Define data model
- [x] Deserialize ginkgo outline output into flat and nested representation
- [x] Implement symbol selector using the flat representation
- [x] Implement static Outline view using the nested representation
- [x] Call `ginkgo outline` with current doc
- [x] Implement auto-refreshing Outline view (refresh whenever
  doc.onDidChangeTextDocument event fires)
- [ ] Conform to https://code.visualstudio.com/api/references/extension-guidelines
- [x] Review error handling. Log errors where needed.
- [x] Make ginkgo path, auto-refresh, double-click, and cache TTL configuration options.
- [ ] Don't refresh outline when active editor switches to one with an
unsupported doc (e.g. the Output view is an editor), but document is still in
focus.
- [x] Understand how configuration defaults and invalid inputs work.
- [ ] Don't show notification dialogs again, unless delivering new information.
- [x] Implement "cachedOutliner" that only calls `ginkgo` if there is no outline
  cached for the doc.version. Evict when doc closes or changes. See
  https://github.com/microsoft/vscode/blob/98106c48a07d4d07f0f71b4db9b3ff156f223339/src/vs/workbench/contrib/timeline/browser/timelinePane.ts#L77
- [ ] Support vscode cancellation tokens where possible
- [ ] Suggest fixes for errors in notifications (e.g. install ginkgo, if it's not found)
- [ ] Context menu and "editor actions" for outline view, for example, to collapse or expand the tree, or a subtree.
- [x] Remove 'getConfiguration' calls from treeDataProvider; synchronize configuration in extension.ts, as done for Outliner.
- [ ] Use verbosity levels in log; hide debug information by default.
- [ ] Add license and copyright boilerplate.
- [x] Show empty quickpick menu, instead of error notification, for non-go docs.
- [ ] Show empty quickpick menu and outline view, instead of error notification, if go doc has no ginkgo symbols. Right now, `ginkgo outline` returns an error: `Error: error running "/home/dlipovetsky/projects/ginkgo/ginkgo/ginkgo outline --format=json -" (error code 1): error creating outline: file does not import "github.com/onsi/ginkgo" or "github.com/onsi/ginkgo/extensions/table`
## Implementation Notes

- When 'contributes.viewContainers.panel' support was added, it doesn't support extension-qualified identifiers, e.g. 'myextension.panel',
  because of the regex pattern required here:
  https://github.com/microsoft/vscode/blame/686cd7df530fc4d294b9580339cb8e3e3169156c/src/vs/workbench/api/browser/viewsExtensionPoint.ts#L68
  that was added to fix this problem https://github.com/microsoft/vscode/issues/48563.
  For some reason, 'contributes.views' does not require that regex pattern.
