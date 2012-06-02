/* Io.js CLI program runner.
 *
 * By now, it only returns the parsed Abstract Syntax Tree of the program.
 */

var PEG = require('pegjs');
var fs = require('fs');
var rules = fs.readFileSync('io.pegjs', 'utf-8');
var parse = PEG.buildParser(rules, { trackLineAndColumn: true }).parse;
var util = require('util');
var _ = require("underscore");
var program;
var env, tree;
var elem;

function trim(string) { return string.replace(/^\s*|\s*$/g, '') }

if(process.argv.length != 3) {
    console.error("Usage: %s %s <program>", process.argv[0], process.argv[1]);
    process.exit(-1);
}

try {
    program = fs.readFileSync(process.argv[2], 'utf-8');
    tree = parse(program);
    console.log(JSON.stringify(tree, undefined, 2));
} catch(err) {
    console.error("ERROR:", err.message);
    if(_.has(err, 'expr')) {
        console.error("EXPRESSION: ", err.expr);
    }
}

