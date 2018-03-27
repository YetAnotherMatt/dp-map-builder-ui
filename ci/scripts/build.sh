#!/bin/bash -eux

pushd dp-map-builder-ui
  npm install --unsafe-perm
  npm test
  npm run build
popd

cp -r dp-map-builder-ui/dist/* build

cp -r dp-map-builder-ui/{.npmignore,README.md,dist,node_modules,package*.json,webpack*.config.js} package/
