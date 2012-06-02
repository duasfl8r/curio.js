var settings = {
    PEGJS_FILE: __dirname + '/parser/io.pegjs',
}

var PEG = require('pegjs');
var fs = require('fs');

var rules = fs.readFileSync(settings.PEGJS_FILE, 'utf-8');
var parse = PEG.buildParser(rules).parse;

if(typeof module !== 'undefined') {
    exports.parse = parse;
}
