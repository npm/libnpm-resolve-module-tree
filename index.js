'use strict'
module.exports = resolveDependencies
const Bluebird = require('bluebird')
const validate = require('aproba')

/*
* Produce proper tree from disk (read-package-tree or read-module-tree + JSON reading + filtering)
* Todo: Tool to produce tree from lock/shrinkwrap
* Todo: Bundle support, which means, extract bundles to disk, read from disk to produce tree
* Todo: Import shrinkwraps
*/

function resolveDependencies (deps, tree, fpm) {
  validate('OOF|OF', arguments)
  if (arguments.length === 2) {
    fpm = tree
    tree = {}
  }
  const ctx = {manifest: tree.manifest, requires: [], requiredBy: []}
  const seen = recordExisting(tree)
  return recurseDeps(deps, ctx, fpm, seen)
}

function fromDiskPackage (tree) {
  return {manifest: tree.manifest, requires: [], requiredBy: []}
}

function recordExisting (tree, seen) {
  if (!seen) seen = new Map()
  let toRecord = tree.children || []
  let index = 0
  while (index < toRecord.length) {
    const ctx = toRecord[index++]
    if (seen.has(packageId(ctx))) continue
    seen.set(packageId(ctx), ctx)
    toRecord.push.apply(toRecord, ctx.children || [])
  }
  return seen
}

function recurseDeps (deps, ctx, fpm, seen) {
  validate('OOFO', [deps, ctx, fpm, seen])
  if (seen.has(packageId(ctx))) return Bluebird.resolve(ctx)
  seen.set(packageId(ctx), ctx)
  return Bluebird.map(Object.keys(deps), name => {
    return Bluebird.try(() => {
      const errorId = name + '@' + deps[name]
      // cached errors
      if (seen.has(errorId)) {
        return seen.get(errorId)
      } else {
        return fpm(name, deps[name]).then(manifest => {
          if (seen.has(packageId(manifest))) {
            return seen.get(packageId(manifest))
          } else {
            return {manifest: manifest, requires: [], requiredBy: []}
          }
        }).catch(err => {
          return {manifest: {name: name, version: deps[name]}, error: err, requires: [], requiredBy: []}
        })
      }
    }).then(pkg => {
      if (pkg.requiredBy.indexOf(ctx) === -1) pkg.requiredBy.push(ctx)
      if (ctx.requires.indexOf(pkg) === -1) ctx.requires.push(pkg)
      return pkg
    })
  }).then(requires => {
    return Bluebird.map(requires, req => recurseDeps(req.manifest.dependencies || {}, req, fpm, seen))
  }).reduce((all, req) => all.concat(req), [ctx])
}

function packageId (pkg) {
  const manifest = pkg.manifest || pkg
  return manifest.name + '@' + manifest.version
}
