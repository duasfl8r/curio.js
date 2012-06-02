/* Parsing tests.
 *
 * Uses Mocha + Chai for TDD assertions.
 */

var assert;
var io, parse;

if(typeof module !== 'undefined') {
    assert = require('chai').assert;
    io = require('../../io')
    parse = io.parse
} else {
    assert = chai.assert;
}

var parse_rule = function(parse_fn, ruleName) {
    return function(string) {
        return parse_fn(string, ruleName);
    };
};

suite('number', function() {
    var parse_num = parse_rule(parse, 'number');

    test('integer', function() {
        assert.equal(parse_num('42'), 42);
    });

    test('float', function() {
        assert.equal(parse_num('42.555'), 42.555);
    });

    test('hexadecimal', function() {
        assert.equal(parse_num('0xabc'), 0xabc);
        assert.equal(parse_num('0XABC'), 0XABC);
    });

    test('float without integer part', function() {
        assert.equal(parse_num('.1023'), 0.1023);
    });

    test('with exponential', function() {
        assert.equal(parse_num('10.5e103'), 10.5 * Math.pow(10, 103));
    });

    test('with negative exponential', function() {
        assert.equal(parse_num('10.5e-103'), 10.5 * Math.pow(10, -103));
    });
});

// identifier
//     = first:(letter / "_") rest:((letter / digit / "_")*)
//         { return [first].concat(rest).join(""); }
//
suite('identifier', function() {
    var parse_id = parse_rule(parse, 'identifier');

    test('may contain letters, digits and underscores', function() {
        assert.equal(parse_id('my_1st_try'), 'my_1st_try');
    });

    test('may not start with a digit', function() {
        assert.throws(function() { parse_id('1st_try'); });
    });
});

suite('symbol', function() {
    var parse_sym = parse_rule(parse, 'symbol');

    test('identifier', function() {
        assert.deepEqual(parse_sym('bananas'), {
            tag: 'id',
            value: 'bananas',
        });
    });

    test('number', function() {
        assert.deepEqual(parse_sym('10.5'), {
            tag: 'number',
            value: 10.5,
        });
    });

    test('operator', function() {
        assert.deepEqual(parse_sym('?'), {
            tag: 'operator',
            value: '?',
        });
    });

    test('quote', function() {
        assert.deepEqual(parse_sym('"i am a banana"'), {
            tag: 'quote',
            value: 'i am a banana'
        });
    });
});

suite('quote', function() {
    var parse_quo = parse_rule(parse, 'quote');

    test('monoquote', function() {
        assert.equal(parse_quo('"i am a banana"'), 'i am a banana');
    });

    test('monoquote can\'t span lines', function() {
        assert.throws(function() { parse_quo('"i am\na banana"'); });
    });

    test('monoquote with escaped quotes', function() {
        assert.equal(parse_quo('"\\"that\'s it\\", she said"'), '"that\'s it", she said');
    });

    test('triquote', function() {
        assert.equal(parse_quo('"""i am a banana"""'), 'i am a banana');
    });

    test('triquote can span many lines', function() {
        assert.equal(parse_quo('"""i\nam\na\nbanana"""'), 'i\nam\na\nbanana');
    });
});
