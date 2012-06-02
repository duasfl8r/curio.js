/* Io.js PEGJS parsing rules.
 *
 * Mostly adapted from Io Guide's BNF grammar:
 * http://www.iolanguage.com/scm/io/docs/IoGuide.html#Appendix-Grammar
 */

{
    var unescape;

    // TODO: replace escaped chars the same way Io does.
    // I don't really know the details of Io's procedure for replacing
    // backslash-escaped chars. I am using Javascript's own procedure,
    // evaluating the Io string as a JS string.
    unescape = function(string) {
        return eval('"' + string + '"');
    };
}

start
    = expression*

///// MESSAGES

expression
    = m:message sctpad
        { return m; }

message
    = s:symbol args:arguments
        { return { tag: "message", symbol: s, args: args }}
    / s:symbol
        { return { tag: "message", symbol: s, args: [] }}

arguments
    = open whitespace close
        { return []; }
    / open first:argument rest:(comma_argument*) close
        { return [first].concat(rest); }

comma_argument
    = comma arg:argument
        { return arg; }

argument
    = wcpad? arg:message wcpad?
        { return arg; }

///// SYMBOLS

symbol
    = q:quote
        { return { tag: "quote", value: q }; }
    / op:operator
        { return { tag: "operator", value: op }; }
    / id:identifier
        { return { tag: "id", value: id }; }
    / n:number
        { return { tag: "number", value: n }; }

identifier
    = first:(letter / "_") rest:((letter / digit / "_")*)
        { return [first].concat(rest).join(""); }

operator
    = ":" / "." / "'" / "~" / "!" / "@" / "$" / "%" / "^" / "&"
    / "*" / "-" / "+" / "/" / "=" / "{" / "}" / "[" / "]" / "|"
    / "\\" / "<" / ">" / "?"

///// QUOTES

quote = triquote / monoquote

monoquote
    = '"' chars:(mq_char*) '"'
        { return unescape(chars.join("")); }

mq_char
    = '\\"'
    / !("\n") char:[^\"]
        { return char; }

triquote
    = '"""' chars:(triquote_char*) '"""'
        { return chars.join(""); }

triquote_char
    = !('"""') char:.
        { return char; }

///// SPANS

newline
    = "\n"

terminator
    = separator? ";"
    / "\n"
    / "\r" separator?

separator
    = " " / "\f" / "\t" / "\v"

whitespace
    = " "

sctpad
    = separator / comment / terminator

scpad
    = separator / comment

wcpad
    = whitespace / comment

///// COMMENTS

comment = slash_star_comment / slash_slash_comment / pound_comment

slash_star_comment = "/*" (!("*/") .)* "*/"
slash_slash_comment = "//" [^\n]* "\n"
pound_comment = "#" [^\n]* "\n"

///// NUMBERS

number = hex_number / decimal

hex_letter = [a-fA-F]
hex_number = "0" "x"i hex:((digit / hex_letter)*)
    { return parseFloat(parseInt(hex.join(""), 16)); }

decimal
    = b:decimal_base e:(exponential?)
        { return e === "" ? b : b * Math.pow(10, e); }

decimal_base
    = int:digits "." frac:digits
        { return parseFloat(int + "." + frac); }
    / "." frac:digits
        { return parseFloat("0." + frac); }
    / int:digits
        { return parseFloat(int); }

exponential
    = "e" minus:("-"?) exponent:digits
        { return minus === "-" ? -parseFloat(exponent) : parseFloat(exponent); }

///// CHARACTERS

comma = ","
open = "("
close = ")"
letter = [a-zA-Z]
digit = [0-9]
digits = ds:(digit*)
    { return ds.join(""); }

terminator = "\n" / ";"
