
"use strict";

const whitespace_regexp = /^\s*$/;
const textEncoder = new TextEncoder();
const assemble = (opts = {}) => {
  if (opts.src == undefined) {
    throw new Error("no source given to assemble!");
  }
  if (opts.curr_addr == undefined) {
    opts.curr_addr = 0x000000;
  }
  if (opts.symbols == undefined) {
    opts.symbols = new Map();
  }
  if (opts.img == undefined) {
    opts.img = new Map();
  }

  const t000 = opts.src.split("\n");
  // get rid of left whitespace
  const t001 = t000.map((line) => line.trimStart());
  // deal with split lines
  const t002 = t001.reduce((acc, line, idx, arr) => {
    if (acc.skip > 0) {
      acc.skip -= 1;
    } else {
      if (line.endsWith("\\")) {
        const next = arr[idx + 1];
        acc.result.push(line.slice(0, -1).concat(next));
      } else {
        acc.result.push(line);
      }
    }
    return acc;
  }, { skip: 0, result: [] }).result;
  // get rid of comment lines
  const t003 = t002.filter((line) => (!line.startsWith("#"));
  const t004 = (line) => {
    const fields = line.split(" ").filter((word) => !whitespace_regexp.test(word));
    var   incrmnt = 0;
    switch (fields[0].toLower()) {
      case ".org":
        opts.curr_addr = parse_number_or_lookup_symbol(fields[1]);
        break;
      case ".allot": // allot this much space
        opts.curr_addr = incr(opts.curr_addr, parse_number_or_lookup_symbol(fields[1]));
        break;
      case ".dow": // data octoword
        incrmnt += 16;
        // fallthrough
      case ".dqw": // data quadword
        incrmnt += 8;
        // fallthrough
      case ".ddw": // data doubleword
        incrmnt += 4;
        // fallthrough
      case ".dw": // data word
        incrmnt += 2;
        // fallthrough
      case ".dhw": // data halfword
        incrmnt += 1;
        // fallthrough
      case ".db": // data byte
        fields.slice(1).forEach((word) => {
          opts.img.set(opts.curr_addr, parse_number_or_lookup_symbol(word));
          opts.curr_addr = incr(opts.curr_addr, incrmnt);
        });
        incrmnt = 0;
        break;
      case ".utf8":
        const rest_of_line = line.slice(fields[0].length);
        if (!(rest_of_line.startsWith('"') && rest_of_line.endsWith('"'))) {
          throw new Error("utf8 strings must be enclosed within double quotes (\")");
        }
        textEncoder.encode(rest_of_line.slice(1, -1)).forEach((byte) => {
          opts.img.set(opts.curr_addr, byte);
          opts.curr_addr = incr(opts.curr_addr, 1);
        });
        break;
        /*
      case ".zscii":
        throw new Error("yet to be implemented");
        */
      case ":":
        define_symbol(fields[1], opts.curr_addr);
        break;
      case "def":
        define_symbol(fields[1], parse_number_or_lookup_symbol(fields[2]));
        break;
    }
  };
  t003.forEach(t004);
  return;
}
