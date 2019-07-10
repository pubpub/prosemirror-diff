import fs from 'fs';

import { diff } from './diff';
import { buildRegistry, baseRegistry } from './registry';
import { buildSchema } from './schemas';
import { resolve } from './resolve';
import { decorate } from './decorate';

const registry = buildRegistry(baseRegistry);

const oldVersion = JSON.parse(fs.readFileSync('./test/diff-old.json'));
const newVersion = JSON.parse(fs.readFileSync('./test/diff-new.json'));

const diffed = diff(oldVersion, newVersion, registry);
debugger;
const editorSchema = buildSchema();
const { doc, additions, removals } = resolve(diffed, registry);
const docNode = editorSchema.nodeFromJSON(doc);
const decorated = decorate(
    docNode,
    editorSchema,
    additions,
    removals,
    registry
);
console.log(decorated);
