#!/bin/sh
set -e -x

# 1) Generate protos into src/generated
protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts --js_out=import_style=commonjs,binary:src/generated --ts_out=service=true:src/generated -I ../pb/ ../pb/*.proto

# 2) Compile typescript into dist/
tsc

# 3) Copy over src/generated js/d.ts bundles (ie. protofiles that are not services) into dist/generated (because tsc doesn't do that for us...)
mkdir -p dist/generated
for f in src/generated/*.js; do
    base=$(basename "${f}" .js)
    cp -v "src/generated/${base}.js" dist/generated
    cp -v "src/generated/${base}.d.ts" dist/generated
done
