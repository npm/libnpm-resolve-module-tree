'use strict'
const resolvePackageTree = require('./index.js')
const npa = require('npm-package-arg')
const pacote = require('pacote')

function fpm (name, range) {
  return pacote.manifest(npa.resolve(name, range), {cache: '/Users/rebecca/.npm/_cacache'})
}

const tree = {
  manifest: {
    name: 'root',
    version: '1.0.0',
    dependencies: {'npm': '^4'}
  },
  children: []
}


resolvePackageTree(tree.manifest.dependencies, tree, fpm).then(tree => {
  tree.forEach(pkg => display(pkg))
})

function display (tree, indent=0, seen=new Set()) {
  console.log(rep(indent, '  ') + packageId(tree)
    + (seen.has(tree) ? ' (duplicate)' : '')
    + (tree.error ? ` (error: ${tree.error.message})` : ''))
  if (seen.has(tree)) return
  seen.add(tree)
  
  tree.requires.forEach(req => display(req, indent + 1, seen))
}

function rep (num, str) {
  let val = ''
  for (let ii=0; ii<num; ++ii) val += str
  return val
}

function packageId (pkg) {
  const manifest = pkg.manifest || pkg
  return manifest.name + '@' + manifest.version
}

function mkpkg (name, version) {
  return 
}