#!/usr/bin/env node

const fs = require("fs");
const rawContents = fs.readFileSync("src/ModulinEvent.js", 'utf8');
const content = rawContents.replace(/\/\*\*[\w\W]*?\*\//g, '');

const global = content.replace(/^export default/gm, '');
fs.writeFileSync("dist/ModulinEvent.js", global);

const node = content.replace(/^export default?/gm, 'module.exports =');
fs.writeFileSync("dist/ModulinEvent.node.js", node);
