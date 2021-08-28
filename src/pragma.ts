// This file is copied straight from Prettier's JS implementation,
// since everything works exactly the same for Apex code.

const docblock = require("jest-docblock");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'hasPragma'... Remove this comment to see the full error message
function hasPragma(text: any) {
  const pragmas = Object.keys(docblock.parse(docblock.extract(text)));
  return pragmas.indexOf("prettier") !== -1 || pragmas.indexOf("format") !== -1;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'insertPrag... Remove this comment to see the full error message
function insertPragma(text: any) {
  const parsedDocblock = docblock.parseWithComments(docblock.extract(text));
  const pragmas = { format: "", ...parsedDocblock.pragmas };
  const newDocblock = docblock
    .print({
      pragmas,
      comments: parsedDocblock.comments.replace(/^(\s+?\r?\n)+/, ""), // remove leading newlines
    })
    .replace(/(\r\n|\r)/g, "\n"); // normalise newlines (mitigate use of os.EOL by jest-docblock)
  const strippedText = docblock.strip(text);
  const separatingNewlines = strippedText.startsWith("\n") ? "\n" : "\n\n";
  return newDocblock + separatingNewlines + strippedText;
}

module.exports = {
  hasPragma,
  insertPragma,
};
