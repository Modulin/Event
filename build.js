#!/usr/bin/env node

const fs = require("fs");
const rawContents = fs.readFileSync("src/Event.js", 'utf8');
const content = rawContents.replace(/\/\*\*[\w\W]*?\*\//g, '');

const global = content.replace(/^export default .*$/gm, '');
fs.writeFileSync("dist/Event.js", global);

const node = content.replace(/^export default?/gm, 'module.exports =');
fs.writeFileSync("dist/Event.node.js", node);
