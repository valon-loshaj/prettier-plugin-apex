// @ts-expect-error ts-migrate(6200) FIXME: Definitions of the following identifiers conflict ... Remove this comment to see the full error message
const {
  canAttachComment,
  handleEndOfLineComment,
  handleOwnLineComment,
  handleRemainingComment,
  hasPrettierIgnore,
  isBlockComment,
  printComment,
  willPrintOwnComments,
} = require("./comments");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'parse'.
const parse = require("./parser");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'hasPragma'... Remove this comment to see the full error message
const { hasPragma, insertPragma } = require("./pragma");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'print'.
const print = require("./printer");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'massageAst... Remove this comment to see the full error message
const { massageAstNode } = require("./util");

const languages = [
  {
    name: "Apex",
    parsers: ["apex"],
    extensions: [".cls", ".trigger"],
    linguistLanguageId: 17,
    vscodeLanguageIds: ["apex"],
  },
  {
    name: "Apex Anonymous",
    parsers: ["apex-anonymous"],
    extensions: [".apex"],
    linguistLanguageId: 17,
    vscodeLanguageIds: ["apex-anon"],
  },
];

function locStart(node: any) {
  const location = node.loc ? node.loc : node.location;
  return location.startIndex;
}

function locEnd(node: any) {
  const location = node.loc ? node.loc : node.location;
  return location.endIndex;
}

const parsers = {
  apex: {
    astFormat: "apex",
    parse,
    locStart,
    locEnd,
    hasPragma,
    preprocess: (text: any) => text.trim(),
  },
  "apex-anonymous": {
    astFormat: "apex",
    parse,
    locStart,
    locEnd,
    hasPragma,
    preprocess: (text: any) => text.trim(),
  },
};

const printers = {
  apex: {
    print,
    massageAstNode,
    hasPrettierIgnore,
    insertPragma,
    isBlockComment,
    canAttachComment,
    printComment,
    willPrintOwnComments,
    handleComments: {
      ownLine: handleEndOfLineComment,
      endOfLine: handleOwnLineComment,
      remaining: handleRemainingComment,
    },
  },
};

const CATEGORY_APEX = "apex";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'options'.
const options = {
  apexStandaloneParser: {
    type: "choice",
    category: CATEGORY_APEX,
    default: "none",
    choices: [
      {
        value: "none",
        description: "Do not use a standalone parser",
      },
      {
        value: "built-in",
        description: "Use the built in HTTP standalone parser",
      },
    ],
    description:
      "Use a standalone process to speed up parsing. This process needs to be started and stopped separately from the Prettier process",
  },
  apexStandaloneHost: {
    type: "string",
    category: "Global",
    default: "localhost",
    description:
      "The standalone server host to connect to. Only applicable if apexStandaloneParser is true. Default to localhost.",
  },
  apexStandalonePort: {
    type: "int",
    category: CATEGORY_APEX,
    default: 2117,
    description:
      "The standalone server port to connect to. Only applicable if apexStandaloneParser is true. Default to 2117.",
  },
  apexInsertFinalNewline: {
    type: "boolean",
    category: CATEGORY_APEX,
    default: true,
    description:
      "Whether to insert one newline as the last thing in the output. Default to true.",
  },
};

const defaultOptions = {};

module.exports = {
  languages,
  printers,
  parsers,
  options,
  defaultOptions,
};
