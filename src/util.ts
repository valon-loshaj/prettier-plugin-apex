/* eslint no-param-reassign: 0 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'constants'... Remove this comment to see the full error message
const constants = require("./constants");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'apexTypes'... Remove this comment to see the full error message
const apexTypes = constants.APEX_TYPES;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isBinaryis... Remove this comment to see the full error message
function isBinaryish(node: any) {
  return (
    node["@class"] === apexTypes.BOOLEAN_EXPRESSION ||
    node["@class"] === apexTypes.BINARY_EXPRESSION
  );
}

/**
 * Check if this comment is an ApexDoc-style comment.
 * This code is straight from prettier JSDoc detection.
 * @param comment the comment to check.
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isApexDocC... Remove this comment to see the full error message
function isApexDocComment(comment: any) {
  const lines = comment.value.split("\n");
  return (
    lines.length > 1 &&
    lines
      .slice(1, lines.length - 1)
      .every((commentLine: any) => commentLine.trim()[0] === "*")
  );
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'checkIfPar... Remove this comment to see the full error message
function checkIfParentIsDottedExpression(path: any) {
  const node = path.getValue();
  const parentNode = path.getParentNode();

  let result = false;
  // We're making an assumption here that `callParent` is always synchronous.
  // We're doing it because FastPath does not expose other ways to find the
  // parent name.
  let parentNodeName = "";
  let grandParentNodeName = "";
  path.callParent((innerPath: any) => {
    parentNodeName = innerPath.getName();
  });
  path.callParent((innerPath: any) => {
    grandParentNodeName = innerPath.getName();
  }, 1);
  if (parentNodeName === "dottedExpr") {
    result = true;
  } else if (
    node["@class"] === apexTypes.VARIABLE_EXPRESSION &&
    parentNode["@class"] === apexTypes.ARRAY_EXPRESSION &&
    grandParentNodeName === "dottedExpr"
  ) {
    // a
    //   .b[0]  // <- Node b here
    //   .c()
    // For this situation we want to flag b as a nested dotted expression,
    // so that we can make it part of the grand parent's group, even though
    // technically it's the grandchild of the dotted expression.
    result = true;
  }
  return result;
}

// The metadata corresponding to these keys cannot be compared for some reason
// or another, so we will delete them before the AST comparison
const METADATA_TO_IGNORE = [
  "loc",
  "location",
  "lastNodeLoc",
  "text",
  "rawQuery",
  "@id",
  // It is impossible to preserve the comment AST. Neither recast nor
  // prettier tries to do it so we are not going to bother either.
  "comments",
  "$",
  "leading",
  "trailing",
  "hiddenTokenMap",
  "trailingEmptyLine",
  "isLastNodeInArray",
  "numberOfDottedExpressions",
  "isNextStatementOnSameLine",
];

/**
 * Massaging the AST node so that it can be compared. This gets called by
 * Prettier's internal code
 * @param ast the Abstract Syntax Tree to compare
 * @param newObj the newly created object
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'massageAst... Remove this comment to see the full error message
function massageAstNode(ast: any, newObj: any) {
  // Handling ApexDoc
  if (
    ast["@class"] &&
    ast["@class"] === apexTypes.BLOCK_COMMENT &&
    isApexDocComment(ast)
  ) {
    newObj.value = ast.value.replace(/\s/g, "");
  }
  if (ast.scope && typeof ast.scope === "string") {
    // Apex is case insensitivity, but in sone case we're forcing the strings
    // to be uppercase for consistency so the ASTs may be different between
    // the original and parsed strings.
    newObj.scope = ast.scope.toUpperCase();
  } else if (
    ast.dottedExpr &&
    ast.dottedExpr.value &&
    ast.dottedExpr.value.names &&
    ast.dottedExpr.value["@class"] === apexTypes.VARIABLE_EXPRESSION &&
    ast.names
  ) {
    // This is a workaround for #38 - jorje sometimes groups names with
    // spaces as dottedExpr, so we can't compare AST effectively.
    // In those cases we will bring the dottedExpr out into the names.
    newObj.names = newObj.dottedExpr.value.names.concat(newObj.names);
    newObj.dottedExpr = newObj.dottedExpr.value.dottedExpr;
  } else if (
    ast["@class"] &&
    ast["@class"] === apexTypes.WHERE_COMPOUND_EXPRESSION
  ) {
    // This flattens the SOQL/SOSL Compound Expression, e.g.:
    // SELECT Id FROM Account WHERE Name = 'Name' AND (Status = 'Active' AND City = 'Boston')
    // is equivalent to:
    // SELECT Id FROM Account WHERE Name = 'Name' AND Status = 'Active' AND City = 'Boston'
    for (let i = newObj.expr.length - 1; i >= 0; i -= 1) {
      if (
        newObj.expr[i]["@class"] === apexTypes.WHERE_COMPOUND_EXPRESSION &&
        newObj.expr[i].op["@class"] === newObj.op["@class"]
      ) {
        newObj.expr.splice(i, 1, ...newObj.expr[i].expr);
      }
    }
  }
  METADATA_TO_IGNORE.forEach((name) => delete newObj[name]);
}

/**
 * Helper function to find a character in a string, starting at an index.
 * It will ignore characters that are part of comments.
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'findNextUn... Remove this comment to see the full error message
function findNextUncommentedCharacter(
  sourceCode: any,
  character: any,
  fromIndex: any,
  commentNodes: any,
  backwards = false,
) {
  let indexFound = false;
  let index: any;

  const findIndex = (comment: any) =>
    comment.location.startIndex <= index &&
    comment.location.endIndex - 1 >= index;
  while (!indexFound) {
    if (backwards) {
      index = sourceCode.lastIndexOf(character, fromIndex);
    } else {
      index = sourceCode.indexOf(character, fromIndex);
    }
    indexFound = commentNodes.filter(findIndex).length === 0;
    if (backwards) {
      fromIndex = index - 1;
    } else {
      fromIndex = index + 1;
    }
  }
  return index;
}

// One big difference between our precedence list vs Prettier's core
// is that == (and its precedence equivalences) has the same precedence
// as < (and its precedence equivalences).
// e.g. a > b == c > d:
// in Javascript, this would be parsed this as: left (a > b), op (==), right (c > d)
// instead, jorje parses this as:
// left (a > b == c), op (>), right (d)
// The consequence is that formatted code does not look as nice as Prettier's core,
// but we can't change it because it will change the code's behavior.
const PRECEDENCE = {};
[
  ["||"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "===", "!=", "!==", "<>", "<", ">", "<=", ">="],
  [">>", "<<", ">>>"],
  ["+", "-"],
  ["*", "/", "%"],
].forEach((tier, i) => {
  tier.forEach((op) => {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    PRECEDENCE[op] = i;
  });
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getPrecede... Remove this comment to see the full error message
function getPrecedence(op: any) {
  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return PRECEDENCE[op];
}

module.exports = {
  checkIfParentIsDottedExpression,
  findNextUncommentedCharacter,
  getPrecedence,
  isApexDocComment,
  isBinaryish,
  massageAstNode,
};
