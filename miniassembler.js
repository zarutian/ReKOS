
"use strict";

const whitespace_regexp = /^\s*$/;
const     hexdec_rexexp = /^\x30\x78(\d|[A-F]|\x5F)*$/;
const    decimal_rexexp = /^\x30\x64(\d|\x5F)*$/;
const      octal_regexp = /^\x30\x6F([0-7]|\x5F)*$/;
const    quadral_regexp = /^\x30\x71([0-3]|\x5F)*$/;
const     binary_regexp = /^\x30\x62(0|1|\x5F)*$/;
const textEncoder = new TextEncoder();
const makeThenable = () => {
  const r = {};
  const p = new Promise((resolver, rejector) => {
    r.resolver = resolver;
    r.rejector = rejector;
  });
  r.then = (callback, errback) => {
    return p.then(callback, errback);
  };
};
const incr = (a, b) => {
  const ta = typeof(a);
  const tb = typeof(b);
  if (((ta == "number") || (ta == "bigint")) && ((tb == "number") || (tb == "bigint"))) {
    return a + b;
  }
  if ((ta == "object") && ((tb == "number") || (tb == "bigint"))) {
    if (ta.then == undefined) {
      throw new Error("incremented is not a thenable, number, or bigint");
    }
    return ta.then((resolved_a) => incr(resolved_a, b));
  }
  if ((tb == "object") && ((ta == "number") || (ta == "bigint"))) {
    if (tb.then == undefined) {
      throw new Error("increment is not a thenable, number, or bigint");
    }
    return tb.then((resolved_b) => incr(a, resolved_b));
  }
  if ((ta == "object") && (tb == "object")) {
    if (ta.then == undefined) {
      throw new Error("incremented is not a thenable, number, or bigint");
    }
    if (tb.then == undefined) {
      throw new Error("increment is not a thenable, number, or bigint");
    }
    return ta.then((resolved_a) => {
      return tb.then((resolved_b) => incr(resolved_a, resolved_b));
    });
  }
};
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

  if (!opts.symbols.has("《HERE》")) {
    opts.symbols.set("《HERE》", () => {
      return opts.curr_addr;
    });
  }

  const parse_number_or_lookup_symbol = (item) => {
    if (typeof(item) != "string") {
      if (typeof(item) == "function") {
        return parse_number_or_lookup_symbol(item());
      }
      return item
    }
    const t0 = hexdec_rexexp.test(item);
    const t1 = decimal_rexexp.test(item);
    const t2 = octal_regexp.test(item);
    const t3 = quadral_regexp.test(item);
    const t4 = binary_regexp.test(item);
    const t5 = opts.symbols.has(item) && !opts.symbols.has("《NO_SYM_LOOKUP》");
    if ( (t0 || t1 || t2 || t3 || t4) && !t5 ) {
      const base = ({ x: 16, d: 10, o: 8, q: 4, b: 2})[item.at(1)];
      const num  = item.slice(2).split("").filter((char) => (char != "_")).join("");
      if (item.length > 10) {
        return Number.parseInt(num, base);
      } else {
        if ( !t1 && !t3 ) {
          return BigInt(item.split("").filter((char) => (char != "_")).join(""));
        } else {
          let result = 0n;
          num.split("").forEach((char) => {
            result = (result * base) + BigInt(Number.parseInt(char, base));
          });
          return result;
        }
      }
    } else {
      if (! opts.symbols.has(item)) {
        opts.symbols.set(item, makeThenable());
      }
      return opts.symbols.get(item);
    }
  };
  const define_symbol = (name, value) => {
    switch (typeof(value)) {
      case "number": // fallthrough
      case "bigint":
        if (opts.symbols.has(name)) {
          const t0 = opts.symbols.get(name);
          if (typeof(t0) == "object") {
            if (t0.resolve != undefined) {
              opts.symbols.set(name, value);
              t0.resolve(value);
              return;
            } else {
              throw new Error("no resolver");
            }
          } else {
            throw new Error("symbol '".concat(name, "' is already defined as ", t0));
          }
        }
        opts.symbols.set(name, value);
        break;
      case "function": // fallthrough
      case "string":
        define_symbol(name, parse_number_or_lookup_symbol(value));
        break;
      case "object":
        if (value.then != undefined) {
          value.then((resolved) => {
            define_symbol(name, parse_number_or_lookup_symbol(resolved));
          }, (err) => {
            throw new Error("could not define symbol '".concat(name, "' as the .thenable value got smashed/rejected/broken"));
          });
        }
        break;
    }
  };
  const undefine_symbol = (name) => {
    opts.symbols.delete(name);
  };
  const img_set = (addr, value, size) => {
    while (size > 0) {
      const valpart = (value >> (8n * (size - 1n))) & 0xFFn;
      opts.img.set(addr, valpart);
      addr = incr(addr, 1);
      size -= 1;
    }
  };

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
        acc.skip = 1;
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
        let line_done = false;
        fields.slice(1).forEach((word) => {
          if (word == "#") { line_done = true; }
          if (line_done) { return; }
          if (word == "\\#") {
            word = "#";
          }
          const t1 = parse_number_or_lookup_symbol(word);
          const t2 = opts.curr_addr;
          const t3 = incrmnt;
          switch (typeof(t1)) {
            case "number": // fallthrough
            case "bigint":
              img_set(opts.curr_addr, t1, incrmnt);
              break;
            case "object":
              if (t1.then == undefined) {
                throw new Error("non thenable!");
              }
              t1.then((resolved) => {
                img_set(t2, resolved, t3);
              }, (err) => {
              });
              break;
          }
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
      case ".utf8_hwc": // utf8 halfworded count
        const rest_of_line = line.slice(fields[0].length);
        if (!(rest_of_line.startsWith('"') && rest_of_line.endsWith('"'))) {
          throw new Error("utf8 strings must be enclosed within double quotes (\")");
        }
        const bytes = textEncoder.encode(rest_of_line.slice(1, -1))
        const lengd = bytes.length;
        if (lengd > 0xFFFF) {
          throw new Error("length of an counted utf8 string must not be greater than 0xFFFF");
        }
        img_set(opts.curr_addr, lengd, 2);
        opts.curr_addr = incr(opts.curr_addr, 2);
        bytes.forEach((byte) => {
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
      case ".def":
        define_symbol(fields[1], parse_number_or_lookup_symbol(fields[2]));
        break;
      case ".undef":
        undefine_symbol(fields[1]);
    }
  };
  t003.forEach(t004);
  return;
}
