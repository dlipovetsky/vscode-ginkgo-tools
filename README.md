# Ginkgo Tools for VS Code

This VS Code extension offers a set of tools for the [Ginkgo BDD Testing Framework](https://onsi.github.io/ginkgo/). The framework is used in many Go projects, notably Kubernetes.

## Features

### Go To Symbol

### Outline

![Outline screenshot](images/outline-2.png)

## Requirements

### Ginkgo

The extension calls the `ginkgo` executable, but does not include it. To install, please follow [Getting Ginkgo](https://onsi.github.io/ginkgo/#getting-ginkgo).

## Extension Settings

- `ginkgotools.ginkgoPath`: Path to ginkgo executable.

Find other, more advanced settings, in the VS Code Settings Editor.

## Known Issues

The [Go To Symbol](#go-to-symbol) and [Outline](#outline) features require a `ginkgo` executable that implements the `outline` sub-command. As of February 2 2021, only an executable built from the `master` branch implements it, but I expect the `outline` sub-command to be in a future Ginkgo release.

## Release Notes

### 0.1.0

New Features:

- [Go To Symbol](#go-to-symbol)
- [Outline](#outline)
