
"use strict";

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
  t003.forEach((line) => {
    const fields = line.split(" ");
    switch (fields[0].toLower()) {
      case ".org":
        opts.curr_addr = parse_number_or_lookup_symbol(fields[1]);
        break;
      case ".dat":
        break;
      case ".ascii":
      case ".asciiz":
      case ".asciic":
      case ".zscii":
        throw new Error("yet to be implemented");
      case ":":
        define_symbol(fields[1], opts.curr_addr);
        break;
      case "def":
        define_symbol(fields[1], parse_number_or_lookup_symbol(fields[2]));
        break;
    }
  });
  return;
}
