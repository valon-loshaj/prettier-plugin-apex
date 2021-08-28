// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
const { extname } = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prettier'.
const prettier = require("prettier");

const { AST_COMPARE } = process.env;

function read(filename: any) {
  return fs.readFileSync(filename, "utf8");
}

function prettyPrint(src: any, filename: any, options: any) {
  return prettier.format(src, {
    filepath: filename,
    apexStandaloneParser: "built-in",
    apexStandalonePort: 2117,
    apexStandaloneHost: "localhost",
    ...options,
  });
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
function parse(string: any, opts: any) {
  // eslint-disable-next-line no-underscore-dangle
  return prettier.__debug.parse(
    string,
    {
      apexStandaloneParser: "built-in",
      apexStandalonePort: 2117,
      apexStandaloneHost: "localhost",
      ...opts,
    },
    /* massage */ true,
  ).ast;
}

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string: any) {
  if (typeof string !== "string") {
    throw new Error("Raw snapshots have to be strings.");
  }
  return { [Symbol.for("raw")]: string };
}

function runSpec(dirname: any, parsers: any, specOptions: any) {
  /* instabul ignore if */
  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  fs.readdirSync(dirname).forEach((filename: any) => {
    const path = `${dirname}/${filename}`;
    if (
      extname(filename) !== ".snap" &&
      fs.lstatSync(path).isFile() &&
      filename[0] !== "." &&
      filename !== "jsfmt.spec.js"
    ) {
      const source = read(path).replace(/\r\n/g, "\n");

      let options;
      if (!Array.isArray(specOptions)) {
        options = [specOptions];
      } else {
        options = specOptions;
      }
      const mergedOptions = options.map((opts) => ({
        plugins: ["."],
        ...opts,
        parser: parsers[0],
      }));

      mergedOptions.forEach((mergedOpts) => {
        const output = prettyPrint(source, path, mergedOpts);
        // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
        test(`Format ${mergedOpts.parser}: ${filename}`, () => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
          expect(raw(`${source}${"~".repeat(80)}\n${output}`)).toMatchSnapshot(
            filename,
          );
        });

        if (AST_COMPARE) {
          const ast = parse(source, mergedOpts);
          const ppast = parse(output, mergedOpts);
          const secondOutput = prettyPrint(output, path, mergedOpts);

          // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
          test(`Verify AST: ${filename}`, () => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
            expect(ppast).toBeDefined();
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
            expect(ast).toEqual(ppast);
          });

          // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
          test(`Stable format: ${filename}`, () => {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
            expect(secondOutput).toEqual(output);
          });
        }
      });
    }
  });
}
global.runSpec = runSpec;
