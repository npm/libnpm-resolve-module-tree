# resolve package tree

Given a set of dependencies return a fully realized logical tree using only
the most recent package versions.

Optionally you may provide an existing tree and the nodes from that tree
will be reused when they are available.

## WIP

* Correctly resolve modules with bundles.
* Correctly resolve modules with shrinkwraps.
* Accept initial state (in the form of package trees or shrinkwraps)
* 100% test coverage

## resolvePackageTree(deps, fetchManifestCB) → Promise
## resolvePackageTree(deps, existingTree, fetchManifestCB) → Promise

```javascript
const resolvePackageTree = require('libnpm-resolve-package-tree')

const npa = require('npm-package-arg')
const pacote = require('pacote')
function fetchManifest (name, ver) {
  pacote.manifest(npa.resolve(name, range))
}

resolvePackageTree({'lru-cache': '^4.0.0'}, fetchManifest).then(newTree => {
  // tree.requires contains `lru-cache` and its dependencies
})
```
