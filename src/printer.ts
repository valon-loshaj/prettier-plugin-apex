/* eslint no-underscore-dangle: 0 */
import prettier, { AstPath, Doc } from "prettier";
import {
  getTrailingComments,
  printComment,
  printDanglingComment,
} from "./comments";
import {
  checkIfParentIsDottedExpression,
  getPrecedence,
  isBinaryish,
} from "./util";
import {
  ASSIGNMENT,
  APEX_TYPES,
  BINARY,
  BOOLEAN,
  DATA_CATEGORY,
  MODIFIER,
  ORDER,
  ORDER_NULL,
  POSTFIX,
  PREFIX,
  TRIGGER_USAGE,
  QUERY,
  QUERY_WHERE,
} from "./constants";

const docBuilders = prettier.doc.builders;
const { align, concat, join, hardline, line, softline, group, indent, dedent } =
  docBuilders;
const { willBreak } = prettier.doc.utils;

function indentConcat(docs: any) {
  return indent(concat(docs));
}

function groupConcat(docs: any) {
  return group(concat(docs));
}

function groupIndentConcat(docs: any) {
  return group(indent(concat(docs)));
}

function _handlePassthroughCall(...names: any[]) {
  return (path: AstPath, print: any) => path.call(print, ...names);
}

function _pushIfExist(parts: any, doc: any, postDocs: any, preDocs: any) {
  if (doc) {
    if (preDocs) {
      preDocs.forEach((preDoc: any) => parts.push(preDoc));
    }
    parts.push(doc);
    if (postDocs) {
      postDocs.forEach((postDoc: any) => parts.push(postDoc));
    }
  }
  return parts;
}

function _escapeString(text: any) {
  // Code from https://stackoverflow.com/a/11716317/477761
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\u0008/g, "\\b") // eslint-disable-line no-control-regex
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\f/g, "\\f")
    .replace(/\r/g, "\\r")
    .replace(/'/g, "\\'");
}

function handleReturnStatement(path: AstPath, print: any) {
  const node = path.getValue();
  const docs = [];
  docs.push("return");
  const childDocs: Doc = path.call(print, "expr", "value");
  if (childDocs) {
    docs.push(" ");
    docs.push(childDocs);
  }
  docs.push(";");
  if (node.expr.value && isBinaryish(node.expr.value)) {
    return groupIndentConcat(docs);
  }
  return groupConcat(docs);
}

function getOperator(node: any): string {
  if (node.op["@class"] === APEX_TYPES.BOOLEAN_OPERATOR) {
    return BOOLEAN[node.op.$ as keyof typeof BOOLEAN];
  }
  return BINARY[node.op.$ as keyof typeof BINARY];
}

function handleBinaryishExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const nodeOp = getOperator(node);
  const nodePrecedence = getPrecedence(nodeOp);
  const parentNode = path.getParentNode();

  const isLeftNodeBinaryish = isBinaryish(node.left);
  const isRightNodeBinaryish = isBinaryish(node.right);
  const isNestedExpression = isBinaryish(parentNode);
  const isNestedRightExpression =
    isNestedExpression && node === parentNode.right;

  const isNodeSamePrecedenceAsLeftChild =
    isLeftNodeBinaryish &&
    nodePrecedence === getPrecedence(getOperator(node.left));
  const isNodeSamePrecedenceAsParent =
    isBinaryish(parentNode) &&
    nodePrecedence === getPrecedence(getOperator(parentNode));

  const docs = [];
  const leftDoc: Doc = path.call(print, "left");
  const operationDoc: Doc = path.call(print, "op");
  const rightDoc: Doc = path.call(print, "right");

  // This variable signifies that this node is a left child with the same
  // precedence as its parent, and thus should be laid out on the same indent
  // level as its parent, e.g:
  // a = b >
  //   c >  // -> the (b > c) node here
  //   d
  const isLeftChildNodeWithoutGrouping =
    (isNodeSamePrecedenceAsLeftChild || !isLeftNodeBinaryish) &&
    isNestedExpression &&
    isNodeSamePrecedenceAsParent &&
    !isNestedRightExpression;

  // #265 - This variable signifies that the right child of this node should
  // be laid out on the same indentation level, even though the left child node
  // should be in its own group, e.g:
  // a = b > c && d && e -> The node (d) here
  const hasRightChildNodeWithoutGrouping =
    !isLeftChildNodeWithoutGrouping &&
    isNestedExpression &&
    isNodeSamePrecedenceAsParent &&
    !isNestedRightExpression;

  // This variable signifies that the left node and right has the same
  // precedence, and thus they should be laid out on the same indent level, e.g.:
  // a = b > 1 &&
  //   c > 1
  const leftChildNodeSamePrecedenceAsRightChildNode =
    isLeftNodeBinaryish &&
    isRightNodeBinaryish &&
    getPrecedence(getOperator(node.left)) ===
      getPrecedence(getOperator(node.right));
  // This variable signifies that this node is the top most binaryish node,
  // and its left child node has the same precedence, e.g:
  // a = b >
  //   c >
  //   d  // -> the entire node (b > c > d) here
  const isTopMostParentNodeWithoutGrouping =
    isNodeSamePrecedenceAsLeftChild && !isNestedExpression;

  if (
    isLeftChildNodeWithoutGrouping ||
    leftChildNodeSamePrecedenceAsRightChildNode ||
    isTopMostParentNodeWithoutGrouping
  ) {
    docs.push(leftDoc);
    docs.push(" ");
    docs.push(concat([operationDoc, line, rightDoc]));
    return concat(docs);
  }
  if (hasRightChildNodeWithoutGrouping) {
    docs.push(group(leftDoc));
    docs.push(" ");
    docs.push(concat([operationDoc, line, rightDoc]));
    return concat(docs);
  }
  // At this point we know that this node is not in a binaryish chain, so we
  // can safely group the left doc and right doc separately to have this effect:
  // a = b
  //  .c() > d
  docs.push(group(leftDoc));
  docs.push(" ");
  docs.push(groupConcat([operationDoc, line, rightDoc]));
  return groupConcat(docs);
}

function handleAssignmentExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const docs = [];

  const leftDoc: Doc = path.call(print, "left");
  const operationDoc: Doc = path.call(print, "op");
  const rightDoc: Doc = path.call(print, "right");
  docs.push(leftDoc);
  docs.push(" ");
  docs.push(operationDoc);
  if (isBinaryish(node.right)) {
    docs.push(line);
    docs.push(rightDoc);
    return groupIndentConcat(docs);
  }
  docs.push(" ");
  docs.push(rightDoc);
  return groupConcat(docs);
}

function shouldDottedExpressionBreak(path: AstPath) {
  const node = path.getValue();
  // #62 - `super` cannot  be followed any white spaces
  if (
    node.dottedExpr.value["@class"] === APEX_TYPES.SUPER_VARIABLE_EXPRESSION
  ) {
    return false;
  }
  // #98 - Even though `this` can synctactically be followed by whitespaces,
  // make the formatted output similar to `super` to provide consistency.
  if (node.dottedExpr.value["@class"] === APEX_TYPES.THIS_VARIABLE_EXPRESSION) {
    return false;
  }
  if (node["@class"] !== APEX_TYPES.METHOD_CALL_EXPRESSION) {
    return true;
  }
  if (checkIfParentIsDottedExpression(path)) {
    return true;
  }
  if (
    node.dottedExpr.value &&
    node.dottedExpr.value["@class"] === APEX_TYPES.METHOD_CALL_EXPRESSION
  ) {
    return true;
  }
  return node.dottedExpr.value;
}

function handleDottedExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const dottedExpressionParts: Doc[] = [];
  const dottedExpressionDoc: Doc = path.call(print, "dottedExpr", "value");

  if (dottedExpressionDoc) {
    dottedExpressionParts.push(dottedExpressionDoc);
    if (shouldDottedExpressionBreak(path)) {
      dottedExpressionParts.push(softline);
    }
    if (node.isSafeNav) {
      dottedExpressionParts.push("?");
    }
    dottedExpressionParts.push(".");
    return concat(dottedExpressionParts);
  }
  return "";
}

function handleArrayExpressionIndex(
  path: AstPath,
  print: any,
  withGroup = true,
) {
  const node = path.getValue();
  let parts;
  if (node.index["@class"] === APEX_TYPES.LITERAL_EXPRESSION) {
    // For literal index, we will make sure it's always attached to the [],
    // because it's usually short and will look bad being broken up.
    parts = ["[", path.call(print, "index"), "]"];
  } else {
    parts = ["[", softline, path.call(print, "index"), dedent(softline), "]"];
  }
  return withGroup ? groupIndentConcat(parts) : concat(parts);
}

function handleVariableExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const parentNode = path.getParentNode();
  const nodeName = path.getName();
  const { dottedExpr } = node;
  const parts: Doc[] = [];
  const dottedExpressionDoc = handleDottedExpression(path, print);
  const isParentDottedExpression = checkIfParentIsDottedExpression(path);
  const isDottedExpressionSoqlExpression =
    dottedExpr &&
    dottedExpr.value &&
    (dottedExpr.value["@class"] === APEX_TYPES.SOQL_EXPRESSION ||
      (dottedExpr.value["@class"] === APEX_TYPES.ARRAY_EXPRESSION &&
        dottedExpr.value.expr &&
        dottedExpr.value.expr["@class"] === APEX_TYPES.SOQL_EXPRESSION));

  parts.push(dottedExpressionDoc);
  // Name chain
  const nameDocs: Doc[] = path.map(print, "names");
  parts.push(join(".", nameDocs));

  // Technically, in a typical array expression (e.g: a[b]),
  // the variable expression is a child of the array expression.
  // However, for certain situation we need to print the [] part as part of
  // the group from the variable expression. For example:
  // a
  //   .b
  //   .c[
  //     d.callMethod()
  //   ]
  // If we print the [] as part of the array expression, like we usually do,
  // the result will be:
  // a
  //   .b
  //   .c[
  //   d.callMethod()
  // ]
  // Hence why we are deferring the printing of the [] part from handleArrayExpression
  // to here.
  if (
    parentNode["@class"] === APEX_TYPES.ARRAY_EXPRESSION &&
    nodeName === "expr"
  ) {
    path.callParent((innerPath: AstPath) => {
      const withGroup = isParentDottedExpression || !!dottedExpressionDoc;

      parts.push(handleArrayExpressionIndex(innerPath, print, withGroup));
    });
  }
  if (isParentDottedExpression || isDottedExpressionSoqlExpression) {
    return concat(parts);
  }
  return groupIndentConcat(parts);
}

function handleJavaVariableExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("java:");
  parts.push(join(".", path.map(print, "names")));
  return concat(parts);
}

function handleLiteralExpression(path: AstPath, print: any, options: any) {
  const node = path.getValue();
  const literalType: Doc = path.call(print, "type", "$");
  if (literalType === "NULL") {
    return "null";
  }
  const literalDoc: Doc = path.call(print, "literal", "$");
  let doc;
  if (literalType === "STRING") {
    // #165 - We have to use the original string because it might contain Unicode code points,
    // which gets converted to displayed characters automatically by Java after being parsed by jorje.
    doc = options.originalText.slice(node.loc.startIndex, node.loc.endIndex);
  } else if (
    literalType === "LONG" ||
    literalType === "DECIMAL" ||
    literalType === "DOUBLE"
  ) {
    const literal = options.originalText.slice(
      node.loc.startIndex,
      node.loc.endIndex,
    );
    const lastCharacter = literal[literal.length - 1].toLowerCase();
    // We handle the letters d and l at the end of Decimal and Long manually:
    // ```
    // Decimal a = 1.0D
    // Long b = 4324234234l
    // ```
    // should be formatted to:
    // ```
    // Decimal a = 1.0d
    // Long b = 4324234234L
    // ```
    // In general we try to keep keywords lowercase, however uppercase L is better
    // the lowercase l because lowercase l can be mistaken for number 1
    if (lastCharacter === "d") {
      doc = `${literal.substring(0, literal.length - 1)}d`;
    } else if (lastCharacter === "l") {
      doc = `${literal.substring(0, literal.length - 1)}L`;
    } else {
      doc = literal;
    }
  }
  if (doc) {
    return doc;
  }
  return literalDoc;
}

function handleBinaryOperation(path: AstPath) {
  const node = path.getValue();
  return BINARY[node.$ as keyof typeof BINARY];
}

function handleBooleanOperation(path: AstPath) {
  const node = path.getValue();
  return BOOLEAN[node.$ as keyof typeof BOOLEAN];
}

function handleAssignmentOperation(path: AstPath) {
  const node = path.getValue();
  return ASSIGNMENT[node.$ as keyof typeof ASSIGNMENT];
}

function _getDanglingCommentDocs(path: AstPath, print: any, options: any) {
  const node = path.getValue();
  if (!node.comments) {
    return [];
  }
  node.danglingComments = node.comments.filter(
    (comment: any) => !comment.leading && !comment.trailing,
  );
  const danglingCommentParts: any = [];
  path.each((commentPath: AstPath) => {
    danglingCommentParts.push(printDanglingComment(commentPath, options));
  }, "danglingComments");
  delete node.danglingComments;
  return danglingCommentParts;
}

function handleAnonymousBlockUnit(path: AstPath, print: any) {
  // Unlike other compilation units, Anonymous Unit cannot have dangling comments,
  // so we don't have to handle them here.
  const parts: Doc[] = [];
  const memberParts = path
    .map(print, "members")
    .filter((member: any) => member);

  const memberDocs: Doc[] = memberParts.map(
    (memberDoc: any, index: any, allMemberDocs: any) => {
      if (index !== allMemberDocs.length - 1) {
        return concat([memberDoc, hardline]);
      }
      return memberDoc;
    },
  );
  if (memberDocs.length > 0) {
    parts.push(...memberDocs);
  }
  return concat(parts);
}

function handleTriggerDeclarationUnit(path: AstPath, print: any, options: any) {
  const usageDocs: Doc[] = path.map(print, "usages");
  const targetDocs: Doc[] = path.map(print, "target");
  const danglingCommentDocs: Doc[] = _getDanglingCommentDocs(
    path,
    print,
    options,
  );

  const parts: Doc[] = [];
  const usageParts = [];
  parts.push("trigger");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(" ");
  parts.push("on");
  parts.push(" ");
  parts.push(join(",", targetDocs));
  parts.push("(");
  // Usage
  usageParts.push(softline);
  usageParts.push(join(concat([",", line]), usageDocs));
  usageParts.push(dedent(softline));
  parts.push(groupIndentConcat(usageParts));

  parts.push(")");
  parts.push(" ");
  parts.push("{");
  const memberParts = path
    .map(print, "members")
    .filter((member: any) => member);

  const memberDocs: Doc[] = memberParts.map(
    (memberDoc: any, index: any, allMemberDocs: any) => {
      if (index !== allMemberDocs.length - 1) {
        return concat([memberDoc, hardline]);
      }
      return memberDoc;
    },
  );
  if (danglingCommentDocs.length > 0) {
    parts.push(indent(concat([hardline, ...danglingCommentDocs])));
  } else if (memberDocs.length > 0) {
    parts.push(indent(concat([hardline, ...memberDocs])));
  }
  parts.push(dedent(concat([hardline, "}"])));
  return concat(parts);
}

function handleInterfaceDeclaration(path: AstPath, print: any, options: any) {
  const node = path.getValue();

  const superInterface: Doc = path.call(print, "superInterface", "value");
  const modifierDocs: Doc[] = path.map(print, "modifiers");
  const memberParts = path
    .map(print, "members")
    .filter((member: any) => member);
  const danglingCommentDocs: Doc[] = _getDanglingCommentDocs(
    path,
    print,
    options,
  );

  const memberDocs: Doc[] = memberParts.map(
    (memberDoc: any, index: any, allMemberDocs: any) => {
      if (index !== allMemberDocs.length - 1) {
        return concat([memberDoc, hardline]);
      }
      return memberDoc;
    },
  );

  const parts: Doc[] = [];
  if (modifierDocs.length > 0) {
    parts.push(concat(modifierDocs));
  }
  parts.push("interface");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  if (node.typeArguments.value) {
    const typeArgumentParts: Doc[] = path.map(print, "typeArguments", "value");
    parts.push("<");
    parts.push(join(", ", typeArgumentParts));
    parts.push(">");
  }
  if (superInterface) {
    parts.push(" ");
    parts.push("extends");
    parts.push(" ");
    parts.push(superInterface);
  }
  parts.push(" ");
  parts.push("{");
  if (danglingCommentDocs.length > 0) {
    parts.push(indent(concat([hardline, ...danglingCommentDocs])));
  } else if (memberDocs.length > 0) {
    parts.push(indent(concat([hardline, ...memberDocs])));
  }
  parts.push(concat([hardline, "}"]));
  return concat(parts);
}

function handleClassDeclaration(path: AstPath, print: any, options: any) {
  const node = path.getValue();

  const superClass: Doc = path.call(print, "superClass", "value");
  const modifierDocs: Doc[] = path.map(print, "modifiers");
  const memberParts = path
    .map(print, "members")
    .filter((member: any) => member);
  const danglingCommentDocs: Doc[] = _getDanglingCommentDocs(
    path,
    print,
    options,
  );

  const memberDocs: Doc[] = memberParts.map(
    (memberDoc: any, index: any, allMemberDocs: any) => {
      if (index !== allMemberDocs.length - 1) {
        return concat([memberDoc, hardline]);
      }
      return memberDoc;
    },
  );

  const parts: Doc[] = [];
  if (modifierDocs.length > 0) {
    parts.push(concat(modifierDocs));
  }
  parts.push("class");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  if (node.typeArguments.value) {
    const typeArgumentParts: Doc[] = path.map(print, "typeArguments", "value");
    parts.push("<");
    parts.push(join(", ", typeArgumentParts));
    parts.push(">");
  }
  if (superClass !== "") {
    parts.push(" ");
    parts.push("extends");
    parts.push(" ");
    parts.push(superClass);
  }
  const interfaces: Doc[] = path.map(print, "interfaces");
  if (interfaces.length > 0) {
    parts.push(" ");
    parts.push("implements");
    parts.push(" ");
    parts.push(join(", ", interfaces));
  }
  parts.push(" ");
  parts.push("{");
  if (danglingCommentDocs.length > 0) {
    parts.push(indent(concat([hardline, ...danglingCommentDocs])));
  } else if (memberDocs.length > 0) {
    parts.push(indent(concat([hardline, ...memberDocs])));
  }
  parts.push(concat([hardline, "}"]));
  return concat(parts);
}

function handleAnnotation(path: AstPath, print: any) {
  const node = path.getValue();
  const parts: Doc[] = [];
  const trailingParts: any = [];
  const parameterParts = [];
  const parameterDocs: Doc[] = path.map(print, "parameters");
  if (node.comments) {
    // We print the comments manually because this method adds a hardline
    // at the end of the annotation. If we left it to Prettier to print trailing
    // comments it can lead to unstable formatting like this:
    // ```
    // @isTest
    // // Trailing Comment
    // void method() {}
    // ```
    path.each((innerPath: AstPath) => {
      const commentNode = innerPath.getValue();
      // This can only be a trailing comment, because if it is a leading one,
      // it will be attached to the Annotation's parent node (e.g. MethodDecl)
      if (commentNode.trailing) {
        trailingParts.push(" ");
        trailingParts.push(printComment(innerPath));
      }
    }, "comments");
  }
  parts.push("@");
  parts.push(path.call(print, "name", "value"));
  if (parameterDocs.length > 0) {
    parameterParts.push("(");
    parameterParts.push(softline);
    parameterParts.push(join(line, parameterDocs));
    parameterParts.push(dedent(softline));
    parameterParts.push(")");
    parts.push(groupIndentConcat(parameterParts));
  }
  parts.push(...trailingParts);
  parts.push(hardline);
  return concat(parts);
}

function handleAnnotationKeyValue(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "key", "value"));
  parts.push("=");
  parts.push(path.call(print, "value"));
  return concat(parts);
}

function handleAnnotationValue(childClass: any, path: AstPath, print: any) {
  const parts: Doc[] = [];
  switch (childClass) {
    case "TrueAnnotationValue":
      parts.push("true");
      break;
    case "FalseAnnotationValue":
      parts.push("false");
      break;
    case "StringAnnotationValue":
      parts.push("'");
      parts.push(path.call(print, "value"));
      parts.push("'");
      break;
    default:
      throw new Error(
        `AnnotationValue ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return concat(parts);
}

function handleAnnotationString(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("'");
  parts.push(path.call(print, "value"));
  parts.push("'");
  return concat(parts);
}

function handleClassTypeRef(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(join(".", path.map(print, "names")));
  const typeArgumentDocs: Doc[] = path.map(print, "typeArguments");
  if (typeArgumentDocs.length > 0) {
    parts.push("<");
    parts.push(join(", ", typeArgumentDocs));
    parts.push(">");
  }
  return concat(parts);
}

function handleArrayTypeRef(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "heldType"));
  parts.push("[]");
  return concat(parts);
}

function handleJavaTypeRef(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("java:");
  parts.push(join(".", path.map(print, "names")));
  return concat(parts);
}

function _handleStatementBlockMember(modifier: any) {
  return (path: AstPath, print: any) => {
    const statementDoc: Doc = path.call(print, "stmnt");

    const parts: Doc[] = [];
    if (modifier) {
      parts.push(modifier);
      parts.push(" ");
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, statementDoc);
    return concat(parts);
  };
}

function handlePropertyDeclaration(path: AstPath, print: any) {
  const modifierDocs: Doc[] = path.map(print, "modifiers");
  const getterDoc: Doc = path.call(print, "getter", "value");
  const setterDoc: Doc = path.call(print, "setter", "value");

  const parts: Doc[] = [];
  const innerParts = [];
  parts.push(join("", modifierDocs));
  parts.push(path.call(print, "type"));
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(" ");
  parts.push("{");
  if (getterDoc || setterDoc) {
    innerParts.push(line);
  }
  if (getterDoc) {
    innerParts.push(getterDoc);
    if (setterDoc) {
      innerParts.push(line);
    } else {
      innerParts.push(dedent(line));
    }
  }
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
  _pushIfExist(innerParts, setterDoc, [dedent(line)]);
  parts.push(groupIndentConcat(innerParts));
  parts.push("}");
  return groupConcat(parts);
}

function _handlePropertyGetterSetter(action: any) {
  return (path: AstPath, print: any) => {
    const statementDoc: Doc = path.call(print, "stmnt", "value");

    const parts: Doc[] = [];
    parts.push(path.call(print, "modifier", "value"));
    parts.push(action);
    if (statementDoc) {
      parts.push(" ");
      parts.push(statementDoc);
    } else {
      parts.push(";");
    }
    return concat(parts);
  };
}

function handleMethodDeclaration(path: AstPath, print: any) {
  const statementDoc: Doc = path.call(print, "stmnt", "value");
  const modifierDocs: Doc[] = path.map(print, "modifiers");
  const parameterDocs: Doc[] = path.map(print, "parameters");

  const parts: Doc[] = [];
  const parameterParts = [];
  // Modifiers
  if (modifierDocs.length > 0) {
    parts.push(concat(modifierDocs));
  }
  // Return type
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
  _pushIfExist(parts, path.call(print, "type", "value"), [" "]);
  // Method name
  parts.push(path.call(print, "name"));
  // Params
  parts.push("(");
  if (parameterDocs.length > 0) {
    parameterParts.push(softline);
    parameterParts.push(join(concat([",", line]), parameterDocs));
    parameterParts.push(dedent(softline));
    parts.push(groupIndentConcat(parameterParts));
  }
  parts.push(")");
  // Body
  _pushIfExist(parts, statementDoc, null, [" "]);
  if (!statementDoc) {
    parts.push(";");
  }
  return concat(parts);
}

function handleModifierParameterRef(path: AstPath, print: any) {
  const parts: Doc[] = [];
  // Modifiers
  parts.push(join("", path.map(print, "modifiers")));
  // Type
  parts.push(path.call(print, "typeRef"));
  parts.push(" ");
  // Value
  parts.push(path.call(print, "name"));
  return concat(parts);
}

function handleEmptyModifierParameterRef(path: AstPath, print: any) {
  const parts: Doc[] = [];
  // Type
  parts.push(path.call(print, "typeRef"));
  parts.push(" ");
  // Value
  parts.push(path.call(print, "name"));
  return concat(parts);
}

function handleStatement(childClass: any, path: AstPath, print: any) {
  let doc;
  switch (childClass) {
    case "DmlInsertStmnt":
      doc = "insert";
      break;
    case "DmlUpdateStmnt":
      doc = "update";
      break;
    case "DmlUpsertStmnt":
      doc = "upsert";
      break;
    case "DmlDeleteStmnt":
      doc = "delete";
      break;
    case "DmlUndeleteStmnt":
      doc = "undelete";
      break;
    default:
      throw new Error(
        `Statement ${childClass} is not supported. Please file a bug report.`,
      );
  }
  const node = path.getValue();
  const parts: Doc[] = [];
  parts.push(doc);
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  // upsert statement has an extra param that can be tacked on at the end
  if (node.id) {
    _pushIfExist(parts, path.call(print, "id", "value"), null, [indent(line)]);
  }
  parts.push(";");
  return groupConcat(parts);
}

function handleDmlMergeStatement(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("merge");
  parts.push(" ");
  parts.push(path.call(print, "expr1"));
  parts.push(line);
  parts.push(path.call(print, "expr2"));
  parts.push(";");
  return groupIndentConcat(parts);
}

function handleEnumDeclaration(path: AstPath, print: any, options: any) {
  const modifierDocs: Doc[] = path.map(print, "modifiers");
  const memberDocs: Doc[] = path.map(print, "members");
  const danglingCommentDocs = _getDanglingCommentDocs(path, print, options);

  const parts: any = [];
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, join("", modifierDocs));
  parts.push("enum");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(" ");
  parts.push("{");
  if (danglingCommentDocs.length > 0) {
    parts.push(indent(concat([hardline, ...danglingCommentDocs])));
  } else if (memberDocs.length > 0) {
    parts.push(
      indent(concat([hardline, join(concat([",", hardline]), memberDocs)])),
    );
  }
  parts.push(concat([hardline, "}"]));
  return concat(parts);
}

function handleSwitchStatement(path: AstPath, print: any) {
  const whenBlocks: Doc[] = path.map(print, "whenBlocks");

  const parts: Doc[] = [];
  parts.push("switch on");
  parts.push(groupConcat([line, path.call(print, "expr")]));
  parts.push(" ");
  parts.push("{");
  parts.push(hardline);
  parts.push(join(hardline, whenBlocks));
  parts.push(dedent(hardline));
  parts.push("}");
  return groupIndentConcat(parts);
}

function handleValueWhen(path: AstPath, print: any) {
  const whenCaseDocs: Doc[] = path.map(print, "whenCases");
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  parts.push("when");
  parts.push(" ");
  const whenCaseGroup = group(indent(join(concat([",", line]), whenCaseDocs)));
  parts.push(whenCaseGroup);
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, statementDoc);
  return concat(parts);
}

function handleElseWhen(path: AstPath, print: any) {
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  parts.push("when");
  parts.push(" ");
  parts.push("else");
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, statementDoc);
  return concat(parts);
}

function handleTypeWhen(path: AstPath, print: any) {
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  parts.push("when");
  parts.push(" ");
  parts.push(path.call(print, "typeRef"));
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, statementDoc);
  return concat(parts);
}

function handleEnumCase(path: AstPath, print: any) {
  return join(".", path.map(print, "identifiers"));
}

function handleRunAsBlock(path: AstPath, print: any) {
  const paramDocs: Doc[] = path.map(print, "inputParameters");
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  parts.push("System.runAs");
  parts.push("(");
  parts.push(join(concat([",", line]), paramDocs));
  parts.push(")");
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, statementDoc);
  return concat(parts);
}

function handleBlockStatement(path: AstPath, print: any, options: any) {
  const parts: Doc[] = [];
  const danglingCommentDocs = _getDanglingCommentDocs(path, print, options);
  const statementDocs: Doc[] = path.map(print, "stmnts");

  parts.push("{");
  if (danglingCommentDocs.length > 0) {
    parts.push(concat([hardline, ...danglingCommentDocs]));
  } else if (statementDocs.length > 0) {
    parts.push(hardline);
    parts.push(join(hardline, statementDocs));
  }
  parts.push(dedent(hardline));
  parts.push("}");
  return groupIndentConcat(parts);
}

function handleTryCatchFinallyBlock(path: AstPath, print: any) {
  const tryStatementDoc: Doc = path.call(print, "tryBlock");
  const catchBlockDocs: Doc[] = path.map(print, "catchBlocks");
  const finallyBlockDoc: Doc = path.call(print, "finallyBlock", "value");

  const parts: Doc[] = [];
  parts.push("try");
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, tryStatementDoc);
  if (catchBlockDocs.length > 0) {
    // Can't use _pushIfExist here because it doesn't check for Array type
    parts.push(" ");
    parts.push(join(" ", catchBlockDocs));
  }
  _pushIfExist(parts, finallyBlockDoc, null, [" "]);
  return concat(parts);
}

function handleCatchBlock(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("catch");
  parts.push(" ");
  parts.push("(");
  parts.push(path.call(print, "parameter"));
  parts.push(")");
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "stmnt"));
  return concat(parts);
}

function handleFinallyBlock(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("finally");
  parts.push(" ");
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "stmnt"));
  return concat(parts);
}

function handleVariableDeclarations(path: AstPath, print: any) {
  const modifierDocs: Doc[] = path.map(print, "modifiers");

  const parts: Doc[] = [];
  // Modifiers
  parts.push(join("", modifierDocs));

  // Type
  parts.push(path.call(print, "type"));
  parts.push(" ");
  // Variable declarations
  const declarationDocs: Doc[] = path.map(print, "decls");
  if (declarationDocs.length > 1) {
    parts.push(indentConcat([join(concat([",", line]), declarationDocs)]));
    parts.push(";");
  } else if (declarationDocs.length === 1) {
    parts.push(concat([declarationDocs[0], ";"]));
  }
  return groupConcat(parts);
}

function handleVariableDeclaration(path: AstPath, print: any) {
  const node = path.getValue();
  const parts: Doc[] = [];
  let resultDoc;

  parts.push(path.call(print, "name"));
  const assignmentDocs: Doc = path.call(print, "assignment", "value");
  if (assignmentDocs && isBinaryish(node.assignment.value)) {
    parts.push(" ");
    parts.push("=");
    parts.push(line);
    parts.push(assignmentDocs);
    resultDoc = groupIndentConcat(parts);
  } else if (assignmentDocs) {
    parts.push(" ");
    parts.push("=");
    parts.push(" ");
    parts.push(assignmentDocs);
    resultDoc = groupConcat(parts);
  } else {
    resultDoc = groupConcat(parts);
  }
  return resultDoc;
}

function handleNewStandard(path: AstPath, print: any) {
  const paramDocs: Doc[] = path.map(print, "inputParameters");
  const parts: Doc[] = [];
  // Type
  parts.push(path.call(print, "type"));
  // Params
  parts.push("(");
  if (paramDocs.length > 0) {
    parts.push(softline);
    parts.push(join(concat([",", line]), paramDocs));
    parts.push(dedent(softline));
  }
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleNewKeyValue(path: AstPath, print: any) {
  const keyValueDocs: Doc[] = path.map(print, "keyValues");

  const parts: Doc[] = [];
  parts.push(path.call(print, "type"));
  parts.push("(");
  if (keyValueDocs.length > 0) {
    parts.push(softline);
    parts.push(join(concat([",", line]), keyValueDocs));
    parts.push(dedent(softline));
  }
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleNameValueParameter(path: AstPath, print: any) {
  const node = path.getValue();

  const parts: Doc[] = [];
  parts.push(path.call(print, "name"));
  parts.push(" ");
  parts.push("=");
  parts.push(" ");
  if (isBinaryish(node.value)) {
    // Binaryish expressions require their parents to the indentation level,
    // instead of setting it themselves like other expressions.
    parts.push(group(indent(path.call(print, "value"))));
  } else {
    parts.push(path.call(print, "value"));
  }
  return concat(parts);
}

function handleThisMethodCallExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("this");
  parts.push("(");
  parts.push(softline);
  const paramDocs: Doc[] = path.map(print, "inputParameters");
  parts.push(join(concat([",", line]), paramDocs));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleSuperMethodCallExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("super");
  parts.push("(");
  parts.push(softline);
  const paramDocs: Doc[] = path.map(print, "inputParameters");
  parts.push(join(concat([",", line]), paramDocs));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleMethodCallExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const parentNode = path.getParentNode();
  const nodeName = path.getName();
  const { dottedExpr } = node;
  const isParentDottedExpression = checkIfParentIsDottedExpression(path);
  const isDottedExpressionSoqlExpression =
    dottedExpr &&
    dottedExpr.value &&
    (dottedExpr.value["@class"] === APEX_TYPES.SOQL_EXPRESSION ||
      (dottedExpr.value["@class"] === APEX_TYPES.ARRAY_EXPRESSION &&
        dottedExpr.value.expr &&
        dottedExpr.value.expr["@class"] === APEX_TYPES.SOQL_EXPRESSION));
  const isDottedExpressionThisVariableExpression =
    dottedExpr &&
    dottedExpr.value &&
    dottedExpr.value["@class"] === APEX_TYPES.THIS_VARIABLE_EXPRESSION;
  const isDottedExpressionSuperVariableExpression =
    dottedExpr &&
    dottedExpr.value &&
    dottedExpr.value["@class"] === APEX_TYPES.SUPER_VARIABLE_EXPRESSION;

  const dottedExpressionDoc = handleDottedExpression(path, print);
  const nameDocs: Doc[] = path.map(print, "names");
  const paramDocs: Doc[] = path.map(print, "inputParameters");

  const resultParamDoc =
    paramDocs.length > 0
      ? concat([
          softline,
          join(concat([",", line]), paramDocs),
          dedent(softline),
        ])
      : "";

  const methodCallChainDoc = join(".", nameDocs);

  // Handling the array expression index.
  // Technically, in this statement: a()[b],
  // the method call expression is a child of the array expression.
  // However, for certain situation we need to print the [] part as part of
  // the group from the method call expression. For example:
  // a
  //   .b
  //   .c()[
  //     d.callMethod()
  //   ]
  // If we print the [] as part of the array expression, like we usually do,
  // the result will be:
  // a
  //   .b
  //   .c()[
  //   d.callMethod()
  // ]
  // Hence why we are deferring the printing of the [] part from handleArrayExpression
  // to here.
  let arrayIndexDoc: Doc = "";
  if (
    parentNode["@class"] === APEX_TYPES.ARRAY_EXPRESSION &&
    nodeName === "expr"
  ) {
    path.callParent((innerPath: AstPath) => {
      const withGroup = isParentDottedExpression || !!dottedExpressionDoc;

      arrayIndexDoc = handleArrayExpressionIndex(innerPath, print, withGroup);
    });
  }
  let resultDoc;
  const noGroup =
    // If this is a nested dotted expression, we do not want to group it,
    // since we want it to be part of the method call chain group, e.g:
    // a
    //   .b()  // <- this node here
    //   .c()  // <- this node here
    //   .d()
    isParentDottedExpression ||
    // If dotted expression is SOQL and this in inside a binaryish expression,
    // we shouldn't group it, otherwise there will be extraneous indentations,
    // for example:
    // Boolean a =
    //   [
    //     SELECT Id FROM Contact
    //   ].size() > 0
    (isDottedExpressionSoqlExpression && isBinaryish(parentNode)) ||
    // If dotted expression is a `super` or `this` variable expression, we
    // know that this is only one level deep and there's no need to group, e.g:
    // `this.simpleMethod();` or `super.simpleMethod();`
    isDottedExpressionThisVariableExpression ||
    isDottedExpressionSuperVariableExpression;
  if (noGroup) {
    resultDoc = concat([
      dottedExpressionDoc,
      methodCallChainDoc,
      "(",
      group(indent(resultParamDoc)),
      ")",
      arrayIndexDoc,
    ]);
  } else {
    // This means it is the highest level method call expression,
    // and we do need to group and indent the expressions in it, e.g:
    // a
    //   .b()
    //   .c()
    //   .d()  // <- this node here
    resultDoc = group(
      indent(
        concat([
          dottedExpressionDoc,
          // If there is no dottedExpr, we should group the method call chain
          // to have this effect:
          // a.callMethod(  // <- 2 names (a and callMethod)
          //   'a',
          //   'b'
          // )
          // Otherwise we don't want to group them, so that they're part of the
          // parent group. It will format this code:
          // a.b().c().callMethod('a', 'b') // <- 4 names (a, b, c, callMethod)
          // into this:
          // a.b()
          //   .c()
          //   .callMethod('a', 'b')
          dottedExpressionDoc ? methodCallChainDoc : group(methodCallChainDoc),
          "(",
          dottedExpressionDoc
            ? group(indent(resultParamDoc))
            : group(resultParamDoc),
          ")",
          arrayIndexDoc,
        ]),
      ),
    );
  }
  return resultDoc;
}

function handleJavaMethodCallExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("java:");
  parts.push(join(".", path.map(print, "names")));
  parts.push("(");
  parts.push(softline);
  parts.push(join(concat([",", line]), path.map(print, "inputParameters")));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleNestedExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("(");
  parts.push(path.call(print, "expr"));
  parts.push(")");
  return concat(parts);
}

function handleNewSetInit(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const expressionDoc: Doc = path.call(print, "expr", "value");

  // Type
  parts.push("Set");
  parts.push("<");
  parts.push(join(concat([",", " "]), path.map(print, "types")));
  parts.push(">");
  // Param
  parts.push("(");
  _pushIfExist(parts, expressionDoc, [dedent(softline)], [softline]);
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleNewSetLiteral(path: AstPath, print: any) {
  const valueDocs: Doc[] = path.map(print, "values");

  const parts: Doc[] = [];
  // Type
  parts.push("Set");
  parts.push("<");
  parts.push(join(concat([",", " "]), path.map(print, "types")));
  parts.push(">");
  // Values
  parts.push("{");
  if (valueDocs.length > 0) {
    parts.push(line);
    parts.push(join(concat([",", line]), valueDocs));
    parts.push(dedent(line));
  }
  parts.push("}");
  return groupIndentConcat(parts);
}

function handleNewListInit(path: AstPath, print: any) {
  // We can declare lists in the following ways:
  // new Object[size];
  // new Object[] { value, ... };
  // new List<Object>(); // Provides AST consistency.
  // new List<Object>(size);

  // #262 - We use Object[size] if a literal number is provided.
  // We use List<Object>(param) otherwise.
  // This should provide compatibility for all known types without knowing
  // if the parameter is a variable (copy constructor) or literal size.

  const expressionDoc: string = path.call(print, "expr", "value");
  const parts: Doc[] = [];
  const typePart: any = path.map(print, "types");
  const hasLiteralNumberInitializer =
    (typePart.group || (typePart.length && typePart[0].parts.length < 4)) &&
    !Number.isNaN(parseInt(expressionDoc, 10));

  // Type
  if (!hasLiteralNumberInitializer) {
    parts.push("List<");
  }
  parts.push(join(".", typePart));
  if (!hasLiteralNumberInitializer) {
    parts.push(">");
  }
  // Param
  parts.push(hasLiteralNumberInitializer ? "[" : "(");
  _pushIfExist(parts, expressionDoc, [dedent(softline)], [softline]);
  parts.push(hasLiteralNumberInitializer ? "]" : ")");
  return groupIndentConcat(parts);
}

function handleNewMapInit(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const expressionDoc: Doc = path.call(print, "expr", "value");

  parts.push("Map");
  // Type
  parts.push("<");
  const typeDocs: Doc[] = path.map(print, "types");
  parts.push(join(", ", typeDocs));
  parts.push(">");
  parts.push("(");
  _pushIfExist(parts, expressionDoc, [dedent(softline)], [softline]);
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleNewMapLiteral(path: AstPath, print: any) {
  const valueDocs: Doc[] = path.map(print, "pairs");

  const parts: Doc[] = [];
  // Type
  parts.push("Map");
  parts.push("<");
  parts.push(join(", ", path.map(print, "types")));
  parts.push(">");
  // Values
  parts.push("{");
  if (valueDocs.length > 0) {
    parts.push(line);
    parts.push(join(concat([",", line]), valueDocs));
    parts.push(dedent(line));
  }
  parts.push("}");
  return groupIndentConcat(parts);
}

function handleMapLiteralKeyValue(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "key"));
  parts.push(" ");
  parts.push("=>");
  parts.push(" ");
  parts.push(path.call(print, "value"));
  return concat(parts);
}

function handleNewListLiteral(path: AstPath, print: any) {
  const valueDocs: Doc[] = path.map(print, "values");

  const parts: Doc[] = [];
  // Type
  parts.push("List<");
  parts.push(join(".", path.map(print, "types")));
  parts.push(">");
  // Values
  parts.push("{");
  if (valueDocs.length > 0) {
    parts.push(line);
    parts.push(join(concat([",", line]), valueDocs));
    parts.push(dedent(line));
  }
  parts.push("}");
  return groupIndentConcat(parts);
}

function handleNewExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("new");
  parts.push(" ");
  parts.push(path.call(print, "creator"));
  return concat(parts);
}

function handleIfElseBlock(path: AstPath, print: any) {
  const node = path.getValue();
  const parts: Doc[] = [];
  const ifBlockDocs: Doc[] = path.map(print, "ifBlocks");
  const elseBlockDoc: Doc = path.call(print, "elseBlock", "value");
  // There are differences when we handle block vs expression statements in
  // if bodies and else body. For expression statement, we need to add a
  // hardline after a statement vs a space for block statement. For example:
  // if (a)
  //   b = 1;
  // else if (c) {
  //   b = 2;
  // }
  const ifBlockContainsBlockStatement = node.ifBlocks.map(
    (ifBlock: any) => ifBlock.stmnt["@class"] === APEX_TYPES.BLOCK_STATEMENT,
  );

  ifBlockDocs.forEach((ifBlockDoc: any, index: any) => {
    if (index > 0) {
      parts.push(
        concat([
          ifBlockContainsBlockStatement[index - 1] ? " " : hardline,
          "else ",
        ]),
      );
    }
    parts.push(ifBlockDoc);
    // We also need to handle the last if block, since it might need to add
    // either a space or a hardline before the else block
    if (index === ifBlockDocs.length - 1 && elseBlockDoc) {
      parts.push(ifBlockContainsBlockStatement[index] ? " " : hardline);
    }
  });
  if (elseBlockDoc) {
    parts.push(elseBlockDoc);
  }
  return groupConcat(parts);
}

function handleIfBlock(path: AstPath, print: any) {
  const statementType: Doc = path.call(print, "stmnt", "@class");
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  const conditionParts = [];
  parts.push("if");
  parts.push(" ");
  // Condition expression
  conditionParts.push("(");
  conditionParts.push(softline);
  conditionParts.push(path.call(print, "expr"));
  conditionParts.push(dedent(softline));
  conditionParts.push(")");
  parts.push(groupIndentConcat(conditionParts));
  // Body block
  if (statementType === APEX_TYPES.BLOCK_STATEMENT) {
    parts.push(" ");
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, statementDoc);
  } else {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, group(indent(concat([hardline, statementDoc]))));
  }
  return concat(parts);
}

function handleElseBlock(path: AstPath, print: any) {
  const statementType: Doc = path.call(print, "stmnt", "@class");
  const statementDoc: Doc = path.call(print, "stmnt");

  const parts: Doc[] = [];
  parts.push("else");
  // Body block
  if (statementType === APEX_TYPES.BLOCK_STATEMENT) {
    parts.push(" ");
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, statementDoc);
  } else {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, group(indent(concat([hardline, statementDoc]))));
  }
  return concat(parts);
}

function handleTernaryExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "condition"));

  parts.push(line);
  parts.push("?");
  parts.push(" ");
  // Here we align the true and false expressions by 2 characters,
  // because the ? and : characters already take up some space,
  // and without adding the alignment, it is difficult to tell
  // the correct nesting level, for example:
  // a == 1
  //   ? someVariable
  //     .callMethod()
  //   : anotherVariable
  //     .anotherMethod()
  // Instead, formatting this way makes it easier to read:
  // a == 1
  //   ? someVariable
  //       .callMethod()
  //   : anotherVariable
  //       .anotherMethod()
  parts.push(group(align(2, path.call(print, "trueExpr"))));
  parts.push(line);
  parts.push(":");
  parts.push(" ");
  parts.push(group(align(2, path.call(print, "falseExpr"))));
  return groupIndentConcat(parts);
}

function handleInstanceOfExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "expr"));
  parts.push(" ");
  parts.push("instanceof");
  parts.push(" ");
  parts.push(path.call(print, "type"));
  return concat(parts);
}

function handlePackageVersionExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("Package.Version.");
  parts.push(path.call(print, "version"));
  return concat(parts);
}

function handleStructuredVersion(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "major"));
  parts.push(".");
  parts.push(path.call(print, "minor"));
  return concat(parts);
}

function handleArrayExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const parts: Doc[] = [];
  const expressionDoc: Doc = path.call(print, "expr");
  // In certain situations we need to defer printing the [] part to be part of
  // the `expr` printing. Take a look at handleVariableExpression or
  // handleMethodCallExpression for example.
  if (
    node.expr &&
    (node.expr["@class"] === APEX_TYPES.VARIABLE_EXPRESSION ||
      node.expr["@class"] === APEX_TYPES.METHOD_CALL_EXPRESSION)
  ) {
    return expressionDoc;
  }
  // For the rest of the situations we can safely print the [index] as part
  // of the array expression group.
  parts.push(expressionDoc);
  parts.push(handleArrayExpressionIndex(path, print, /* withGroup */ true));
  return groupConcat(parts);
}

function handleCastExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("(");
  parts.push(path.call(print, "type"));
  parts.push(")");
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  return concat(parts);
}

function handleExpressionStatement(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "expr"));
  parts.push(";");
  return concat(parts);
}

// SOSL
function handleSoslExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("[");
  parts.push(softline);
  parts.push(path.call(print, "search"));
  parts.push(dedent(softline));
  parts.push("]");
  return groupIndentConcat(parts);
}

function handleFindClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(indentConcat(["FIND", line, path.call(print, "search")]));
  return groupConcat(parts);
}

function handleFindValue(childClass: any, path: AstPath, print: any) {
  let doc: Doc;
  switch (childClass) {
    case "FindString":
      doc = concat(["'", path.call(print, "value"), "'"]);
      break;
    case "FindExpr":
      doc = path.call(print, "expr");
      break;
    default:
      throw new Error(
        `FindValue ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleInClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("IN");
  parts.push(" ");
  parts.push((path.call(print, "scope") as string).toUpperCase());
  parts.push(" ");
  parts.push("FIELDS");
  return concat(parts);
}

function handleDivisionClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("WITH DIVISION = ");
  parts.push(path.call(print, "value"));
  return concat(parts);
}

function handleDivisionValue(childClass: any, path: AstPath, print: any) {
  let doc: Doc;
  switch (childClass) {
    case "DivisionLiteral":
      doc = concat(["'", path.call(print, "literal"), "'"]);
      break;
    case "DivisionExpr":
      doc = path.call(print, "expr");
      break;
    default:
      throw new Error(
        `DivisionValue ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleSearchWithClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("WITH");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(path.call(print, "value", "value"));
  return concat(parts);
}

function handleSearchWithClauseValue(
  childClass: any,
  path: AstPath,
  print: any,
) {
  const parts: Doc[] = [];
  let valueDocs: Doc[];
  switch (childClass) {
    case "SearchWithStringValue":
      valueDocs = path.map(print, "values");
      if (valueDocs.length === 1) {
        parts.push(" = ");
        parts.push(valueDocs[0]);
      } else {
        parts.push(" IN ");
        parts.push("(");
        parts.push(softline);
        parts.push(join(concat([",", line]), valueDocs));
        parts.push(dedent(softline));
        parts.push(")");
      }
      break;
    case "SearchWithTargetValue":
      parts.push("(");
      parts.push(path.call(print, "target"));
      parts.push(" = ");
      parts.push(path.call(print, "value"));
      parts.push(")");
      break;
    case "SearchWithTrueValue":
      parts.push(" = ");
      parts.push("true");
      break;
    case "SearchWithFalseValue":
      parts.push(" = ");
      parts.push("false");
      break;
    default:
      throw new Error(
        `SearchWithClauseValue ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return groupIndentConcat(parts);
}

function handleReturningClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(
    indentConcat([
      "RETURNING",
      line,
      join(concat([",", line]), path.map(print, "exprs")),
    ]),
  );
  return groupConcat(parts);
}

function handleReturningExpression(path: AstPath, print: any) {
  const selectDoc: Doc = path.call(print, "select", "value");

  const parts: Doc[] = [];
  parts.push(path.call(print, "name"));
  if (selectDoc) {
    parts.push("(");
    parts.push(path.call(print, "select", "value"));
    parts.push(")");
  }
  return groupConcat(parts);
}

function handleReturningSelectExpression(path: AstPath, print: any) {
  const fieldDocs: Doc[] = path.map(print, "fields");

  const parts: Doc[] = [];
  parts.push(join(concat([",", line]), fieldDocs));

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "where", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "using", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "orderBy", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "limit", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "offset", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "bind", "value"));
  return groupIndentConcat([softline, join(line, parts)]);
}

function handleSearch(path: AstPath, print: any) {
  const withDocs: Doc[] = path.map(print, "withs");

  const parts: Doc[] = [];
  parts.push(path.call(print, "find"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "in", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "returning", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "division", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "dataCategory", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "limit", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "updateStats", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "using", "value"));
  if (withDocs.length > 0) {
    parts.push(join(line, withDocs));
  }

  return join(line, parts);
}

// SOQL
function handleSoqlExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("[");
  parts.push(softline);
  parts.push(path.call(print, "query"));
  parts.push(dedent(softline));
  parts.push("]");
  return groupIndentConcat(parts);
}

function handleSelectInnerQuery(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("(");
  parts.push(softline);
  parts.push(path.call(print, "query"));
  parts.push(dedent(softline));
  parts.push(")");
  const aliasDoc: Doc = path.call(print, "alias", "value");
  _pushIfExist(parts, aliasDoc, null, [" "]);

  return groupIndentConcat(parts);
}

function handleWhereInnerExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push("(");
  parts.push(softline);
  parts.push(path.call(print, "inner"));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleQuery(path: AstPath, print: any) {
  const withIdentifierDocs: Doc[] = path.map(print, "withIdentifiers");
  const parts: Doc[] = [];
  parts.push(path.call(print, "select"));
  parts.push(path.call(print, "from"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "where", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "with", "value"));
  if (withIdentifierDocs.length > 0) {
    parts.push(join(" ", withIdentifierDocs));
  }
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "groupBy", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "orderBy", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "limit", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "offset", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "bind", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "tracking", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "updateStats", "value"));
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, path.call(print, "options", "value"));
  return join(line, parts);
}

function handleBindClause(path: AstPath, print: any) {
  const expressionDocs: Doc[] = path.map(print, "exprs");
  const parts: Doc[] = [];
  parts.push("BIND");
  parts.push(" ");
  parts.push(join(", ", expressionDocs));
  return concat(parts);
}

function handleBindExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field"));
  parts.push(" ");
  parts.push("=");
  parts.push(" ");
  parts.push(path.call(print, "value"));
  return concat(parts);
}

function handleCaseExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const whenBranchDocs: Doc[] = path.map(print, "whenBranches");
  const elseBranchDoc: Doc = path.call(print, "elseBranch", "value");
  parts.push("TYPEOF");
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(hardline);
  parts.push(join(line, whenBranchDocs));
  if (elseBranchDoc) {
    parts.push(line);
    parts.push(elseBranchDoc);
  }
  parts.push(dedent(softline));
  parts.push("END");
  return groupIndentConcat(parts);
}

function handleWhenExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("WHEN");
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push("THEN");
  parts.push(line);
  const identifierDocs: Doc[] = path.map(print, "identifiers");
  parts.push(join(concat([",", line]), identifierDocs));
  parts.push(dedent(softline));
  return groupIndentConcat(parts);
}

function handleElseExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("ELSE");
  parts.push(" ");
  const identifierDocs: Doc[] = path.map(print, "identifiers");
  parts.push(join(concat([",", line]), identifierDocs));
  parts.push(dedent(softline));
  return groupIndentConcat(parts);
}

function handleColumnClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(
    indentConcat([
      "SELECT",
      line,
      join(concat([",", line]), path.map(print, "exprs")),
    ]),
  );
  return groupConcat(parts);
}

function handleColumnExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field"));
  _pushIfExist(parts, path.call(print, "alias", "value"), null, [" "]);
  return groupConcat(parts);
}

function handleFieldIdentifier(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const entity: Doc = path.call(print, "entity", "value");
  if (entity) {
    parts.push(entity);
    parts.push(".");
  }
  parts.push(path.call(print, "field"));
  return concat(parts);
}

function handleField(path: AstPath, print: any) {
  const functionOneDoc: Doc = path.call(print, "function1", "value");
  const functionTwoDoc: Doc = path.call(print, "function2", "value");

  const parts: any = [];
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
  _pushIfExist(parts, functionOneDoc, ["(", softline]);
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
  _pushIfExist(parts, functionTwoDoc, ["(", softline]);
  parts.push(path.call(print, "field"));
  if (functionOneDoc) {
    parts.push(dedent(softline));
    parts.push(")");
  }
  if (functionTwoDoc) {
    parts.push(dedent(softline));
    parts.push(")");
  }
  return groupConcat(parts);
}

function handleFromClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(
    indentConcat(["FROM", line, join(", ", path.map(print, "exprs"))]),
  );
  return groupConcat(parts);
}

function handleFromExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "table"));
  _pushIfExist(parts, path.call(print, "alias", "value"), null, [" "]);
  _pushIfExist(
    parts,
    path.call(print, "using", "value"),
    [dedent(softline)],
    [line],
  );
  return groupIndentConcat(parts);
}

function handleWhereClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(indentConcat(["WHERE", line, path.call(print, "expr")]));
  return groupConcat(parts);
}

function handleSelectDistanceExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "expr"));
  parts.push(" ");
  parts.push(path.call(print, "alias", "value"));
  return groupConcat(parts);
}

function handleWhereDistanceExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "distance"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  return groupConcat(parts);
}

function handleDistanceFunctionExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const distanceDocs: Doc[] = [];
  parts.push("DISTANCE");
  parts.push("(");
  parts.push(softline);
  distanceDocs.push(path.call(print, "field"));
  distanceDocs.push(path.call(print, "location"));
  distanceDocs.push(`'${path.call(print, "unit")}'`);
  parts.push(join(concat([",", line]), distanceDocs));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleGeolocationLiteral(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const childParts: Doc[] = [];
  parts.push("GEOLOCATION");
  parts.push("(");
  childParts.push(path.call(print, "latitude"));
  childParts.push(path.call(print, "longitude"));
  parts.push(join(concat([",", line]), childParts));
  parts.push(dedent(softline));
  parts.push(")");
  return groupIndentConcat(parts);
}

function handleWithValue(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("WITH");
  parts.push(" ");
  parts.push(path.call(print, "name"));
  parts.push(" ");
  parts.push("=");
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  return concat(parts);
}

function handleWithDataCategories(path: AstPath, print: any) {
  const parts: Doc[] = [];
  const categoryDocs: Doc[] = path.map(print, "categories");
  parts.push("WITH DATA CATEGORY");
  parts.push(line);
  parts.push(join(concat([line, "AND", " "]), categoryDocs));
  parts.push(dedent(softline));
  return groupIndentConcat(parts);
}

function handleDataCategory(path: AstPath, print: any) {
  const parts: Doc[] = [];
  let categoryDocs: Doc[] = path.map(print, "categories");
  categoryDocs = categoryDocs.filter((doc: Doc) => doc);
  parts.push(path.call(print, "type"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  if (categoryDocs.length > 1) {
    parts.push("(");
  }
  parts.push(softline);
  parts.push(join(concat([",", line]), categoryDocs));
  parts.push(dedent(softline));
  if (categoryDocs.length > 1) {
    parts.push(")");
  }
  return groupIndentConcat(parts);
}

function handleDataCategoryOperator(childClass: any) {
  return DATA_CATEGORY[childClass as keyof typeof DATA_CATEGORY];
}

function handleWhereCalcExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field1"));
  parts.push(" ");
  parts.push(path.call(print, "calc"));
  parts.push(" ");
  parts.push(path.call(print, "field2"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  return groupConcat(parts);
}

function handleWhereOperationExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  return groupConcat(parts);
}

function handleWhereOperationExpressions(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "field"));
  parts.push(" ");
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push("(");
  parts.push(
    indentConcat([
      softline,
      join(concat([",", line]), path.map(print, "expr")),
      dedent(softline),
    ]),
  );
  parts.push(")");
  return groupConcat(parts);
}

function escapeSoqlString(text: any, isInLikeExpression: any) {
  let escapedText = text;
  if (!isInLikeExpression) {
    // #340 - In a LIKE expression, the string emitted by jorje is already quoted,
    // so we don't need this step.
    escapedText = escapedText.replace(/\\/g, "\\\\");
  }
  escapedText = escapedText
    .replace(/\u0008/g, "\\b") // eslint-disable-line no-control-regex
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/\f/g, "\\f")
    .replace(/\r/g, "\\r")
    .replace(/'/g, "\\'");
  return escapedText;
}

function handleWhereQueryLiteral(
  childClass: any,
  path: AstPath,
  print: any,
  options: any,
): Doc {
  const node = path.getValue();
  const grandParentNode = path.getParentNode(1);

  let doc: Doc;
  const isInLikeExpression =
    grandParentNode &&
    grandParentNode.op &&
    grandParentNode.op["@class"] === APEX_TYPES.QUERY_OPERATOR_LIKE;
  switch (childClass) {
    case "QueryString":
      // #340 - Query Strings have different properties than normal Apex strings,
      // so we have to handle them separately. They also behave differently
      // depending on whether they are in a LIKE expression vs other expressions.
      doc = concat([
        "'",
        escapeSoqlString(node.literal, isInLikeExpression),
        "'",
      ]);
      break;
    case "QueryNull":
      doc = "NULL";
      break;
    case "QueryTrue":
      doc = "TRUE";
      break;
    case "QueryFalse":
      doc = "FALSE";
      break;
    case "QueryNumber":
      doc = path.call(print, "literal", "$");
      break;
    case "QueryDateTime":
      doc = options.originalText.slice(node.loc.startIndex, node.loc.endIndex);
      break;
    case "QueryDateFormula":
      doc = path.call(print, "dateFormula");
      break;
    default:
      doc = path.call(print, "literal");
  }
  if (doc) {
    return doc;
  }
  return "";
}

function handleWhereCompoundExpression(path: AstPath, print: any) {
  const node = path.getValue();
  const parentNode = path.getParentNode();
  const isNestedExpression =
    parentNode["@class"] === APEX_TYPES.WHERE_COMPOUND_EXPRESSION ||
    parentNode["@class"] === APEX_TYPES.WHERE_UNARY_EXPRESSION;
  const nodeOp = node.op["@class"];
  const isSamePrecedenceWithParent =
    parentNode.op && nodeOp === parentNode.op["@class"];

  const parts: Doc[] = [];

  if (isNestedExpression && !isSamePrecedenceWithParent) {
    parts.push("(");
  }
  const operatorDoc: Doc = path.call(print, "op");
  const expressionDocs: Doc[] = path.map(print, "expr");
  parts.push(join(concat([line, operatorDoc, " "]), expressionDocs));
  if (isNestedExpression && !isSamePrecedenceWithParent) {
    parts.push(")");
  }
  return concat(parts);
}

function handleWhereUnaryExpression(path: AstPath, print: any) {
  const parentNode = path.getParentNode();
  const isNestedExpression =
    parentNode["@class"] === APEX_TYPES.WHERE_COMPOUND_EXPRESSION ||
    parentNode["@class"] === APEX_TYPES.WHERE_UNARY_EXPRESSION;
  const parts: Doc[] = [];
  if (isNestedExpression) {
    parts.push("(");
  }
  parts.push(path.call(print, "op"));
  parts.push(" ");
  parts.push(path.call(print, "expr"));
  if (isNestedExpression) {
    parts.push(")");
  }
  return concat(parts);
}

function handleColonExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(":");
  parts.push(path.call(print, "expr"));
  return concat(parts);
}

function handleOrderByClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("ORDER BY");
  parts.push(
    indentConcat([line, join(concat([",", line]), path.map(print, "exprs"))]),
  );
  return groupConcat(parts);
}

function handleOrderByExpression(childClass: any, path: AstPath, print: any) {
  const parts: Doc[] = [];
  let expressionField;
  switch (childClass) {
    case "OrderByDistance":
      expressionField = "distance";
      break;
    case "OrderByValue":
      expressionField = "field";
      break;
    default:
      throw new Error(
        `OrderBy ${childClass} is not supported. Please file a bug report.`,
      );
  }
  parts.push(path.call(print, expressionField));

  const orderDoc: Doc = path.call(print, "order");
  if (orderDoc) {
    parts.push(" ");
    parts.push(orderDoc);
  }
  const nullOrderDoc: Doc = path.call(print, "nullOrder");
  if (nullOrderDoc) {
    parts.push(" ");
    parts.push(nullOrderDoc);
  }
  return concat(parts);
}

function handleOrderOperation(
  childClass: any,
  path: AstPath,
  print: any,
  opts: any,
) {
  const loc = opts.locStart(path.getValue());
  if (loc) {
    return ORDER[childClass as keyof typeof ORDER];
  }
  return "";
}

function handleNullOrderOperation(
  childClass: any,
  path: AstPath,
  print: any,
  opts: any,
) {
  const loc = opts.locStart(path.getValue());
  if (loc) {
    return ORDER_NULL[childClass as keyof typeof ORDER_NULL];
  }
  return "";
}

function handleGroupByClause(path: AstPath, print: any) {
  const expressionDocs: Doc[] = path.map(print, "exprs");
  const typeDoc: Doc = path.call(print, "type", "value");
  const havingDoc: Doc = path.call(print, "having", "value");

  const parts: Doc[] = [];
  parts.push("GROUP BY");
  if (typeDoc) {
    parts.push(" ");
    parts.push(typeDoc);
    parts.push("(");
    parts.push(softline);
  } else {
    parts.push(line);
  }
  parts.push(join(concat([",", line]), expressionDocs));
  parts.push(dedent(softline));
  if (typeDoc) {
    parts.push(")");
  }
  // #286 - HAVING is part of the GROUP BY node, however we want them to behave
  // like part a query node, because it makes sense to have it on the same
  // indentation as the GROUP BY node.
  if (havingDoc) {
    return concat([groupIndentConcat(parts), line, group(havingDoc)]);
  }
  return groupIndentConcat(parts);
}

function handleGroupByType(childClass: any) {
  let doc;
  switch (childClass) {
    case "GroupByRollUp":
      doc = "ROLLUP";
      break;
    case "GroupByCube":
      doc = "CUBE";
      break;
    default:
      throw new Error(
        `GroupByType ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleHavingClause(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push("HAVING");
  parts.push(line);
  parts.push(path.call(print, "expr"));
  return groupIndentConcat(parts);
}

function handleQueryUsingClause(path: AstPath, print: any) {
  const expressionDocs: Doc[] = path.map(print, "exprs");
  const parts: Doc[] = [];
  parts.push("USING");
  parts.push(line);
  parts.push(join(concat([",", line]), expressionDocs));
  parts.push(dedent(softline));
  return groupIndentConcat(parts);
}

function handleUsingExpression(childClass: any, path: AstPath, print: any) {
  let doc;
  switch (childClass) {
    case "Using":
      doc = concat([
        path.call(print, "name", "value"),
        " ",
        path.call(print, "field", "value"),
      ]);
      break;
    case "UsingEquals":
      doc = concat([
        path.call(print, "name", "value"),
        " = ",
        path.call(print, "field", "value"),
      ]);
      break;
    case "UsingId":
      doc = concat([
        path.call(print, "name"),
        "(",
        path.call(print, "id"),
        " = ",
        path.call(print, "field"),
        ")",
      ]);
      break;
    default:
      throw new Error(
        `UsingExpr ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleTrackingType(childClass: any) {
  let doc;
  switch (childClass) {
    case "ForView":
      doc = "FOR VIEW";
      break;
    case "ForReference":
      doc = "FOR REFERENCE";
      break;
    default:
      throw new Error(
        `TrackingType ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleQueryOption(childClass: any) {
  let doc;
  switch (childClass) {
    case "LockRows":
      doc = "FOR UPDATE";
      break;
    case "IncludeDeleted":
      doc = "ALL ROWS";
      break;
    default:
      throw new Error(
        `QueryOption ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleUpdateStatsClause(path: AstPath, print: any) {
  const optionDocs: Doc[] = path.map(print, "options");
  const parts: Doc[] = [];
  parts.push("UPDATE");
  parts.push(line);
  parts.push(join(concat([",", line]), optionDocs));
  parts.push(dedent(softline));
  return groupIndentConcat(parts);
}

function handleUpdateStatsOption(childClass: any) {
  let doc;
  switch (childClass) {
    case "UpdateTracking":
      doc = "TRACKING";
      break;
    case "UpdateViewStat":
      doc = "VIEWSTAT";
      break;
    default:
      throw new Error(
        `UpdateStatsOption ${childClass} is not supported. Please file a bug report.`,
      );
  }
  return doc;
}

function handleUsingType(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "filter"));
  parts.push(" ");
  parts.push(path.call(print, "value"));
  return concat(parts);
}

function handleModifier(childClass: keyof typeof MODIFIER) {
  const modifierValue = MODIFIER[childClass] || "";
  if (!modifierValue) {
    throw new Error(
      `Modifier ${childClass} is not supported. Please file a bug report.`,
    );
  }
  return concat([modifierValue, " "]);
}

function handlePostfixExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "expr"));
  parts.push(path.call(print, "op"));
  return concat(parts);
}

function handlePrefixExpression(path: AstPath, print: any) {
  const parts: Doc[] = [];
  parts.push(path.call(print, "op"));
  parts.push(path.call(print, "expr"));
  return concat(parts);
}

function handlePostfixOperator(path: AstPath, print: any) {
  return POSTFIX[path.call(print, "$") as keyof typeof POSTFIX];
}

function handlePrefixOperator(path: AstPath, print: any) {
  return PREFIX[path.call(print, "$") as keyof typeof PREFIX];
}

function handleWhileLoop(path: AstPath, print: any) {
  const node = path.getValue();
  const conditionDoc: Doc = path.call(print, "condition");

  const parts: Doc[] = [];
  parts.push("while");
  parts.push(" ");
  parts.push("(");
  // Condition
  parts.push(groupIndentConcat([softline, conditionDoc, dedent(softline)]));
  parts.push(")");
  if (!node.stmnt.value) {
    parts.push(";");
    return concat(parts);
  }
  // Body
  const statementDoc: Doc = path.call(print, "stmnt", "value");
  const statementType: Doc = path.call(print, "stmnt", "value", "@class");
  if (statementType === APEX_TYPES.BLOCK_STATEMENT) {
    parts.push(" ");
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, statementDoc);
  } else {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, group(indent(concat([hardline, statementDoc]))));
  }
  return concat(parts);
}

function handleDoLoop(path: AstPath, print: any) {
  const statementDoc: Doc = path.call(print, "stmnt");
  const conditionDoc: Doc = path.call(print, "condition");

  const parts: Doc[] = [];
  parts.push("do");
  parts.push(" ");
  // Body
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, statementDoc);
  parts.push(" ");
  parts.push("while");
  parts.push(" ");
  parts.push("(");
  // Condition
  parts.push(groupIndentConcat([softline, conditionDoc, dedent(softline)]));
  parts.push(")");
  parts.push(";");
  return concat(parts);
}

function handleForLoop(path: AstPath, print: any) {
  const node = path.getValue();
  const forControlDoc: Doc = path.call(print, "forControl");

  const parts: Doc[] = [];
  parts.push("for");
  parts.push(" ");
  parts.push("(");
  // For Control
  if (
    node.forControl &&
    node.forControl.init &&
    node.forControl.init.expr &&
    node.forControl.init.expr.value &&
    node.forControl.init.expr.value["@class"] === APEX_TYPES.SOQL_EXPRESSION &&
    !willBreak(forControlDoc) // if there are breaks, e.g. comments, we need to be conservative and group them
  ) {
    parts.push(forControlDoc);
  } else {
    parts.push(groupIndentConcat([softline, forControlDoc, dedent(softline)]));
  }
  parts.push(")");
  if (!node.stmnt.value) {
    parts.push(";");
    return concat(parts);
  }
  // Body
  const statementType: Doc = path.call(print, "stmnt", "value", "@class");
  const statementDoc: Doc = path.call(print, "stmnt", "value");
  if (statementType === APEX_TYPES.BLOCK_STATEMENT) {
    parts.push(" ");
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, statementDoc);
  } else {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
    _pushIfExist(parts, group(indent(concat([hardline, statementDoc]))));
  }
  return concat(parts);
}

function handleForEnhancedControl(path: AstPath, print: any) {
  // See the note in handleForInit to see why we have to do this
  const initDocParts: Doc[] = path.call(print, "init");
  const initDoc = join(concat([" ", ":", " "]), initDocParts);

  const parts: Doc[] = [];
  parts.push(path.call(print, "type"));
  parts.push(" ");
  parts.push(initDoc);
  return concat(parts);
}

function handleForCStyleControl(path: AstPath, print: any) {
  const initsDoc: Doc = path.call(print, "inits", "value");
  const conditionDoc: Doc = path.call(print, "condition", "value");
  const controlDoc: Doc = path.call(print, "control", "value");

  const parts: any = [];
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  _pushIfExist(parts, initsDoc);
  parts.push(";");
  _pushIfExist(parts, conditionDoc, null, [line]);
  parts.push(";");
  _pushIfExist(parts, controlDoc, null, [line]);
  return groupConcat(parts);
}

function handleForInits(path: AstPath, print: any) {
  const typeDoc: Doc = path.call(print, "type", "value");
  const initDocsParts = path.map(print, "inits");

  // See the note in handleForInit to see why we have to do this
  // In this situation:
  // for (Integer i; i < 4; i++) {}
  // the second element of initDocParts is null, and so we do not want to add the initialization in
  const initDocs = initDocsParts.map((initDocParts: any) =>
    initDocParts[1]
      ? join(concat([" ", "=", " "]), initDocParts)
      : initDocParts[0],
  );

  const parts: any = [];
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
  _pushIfExist(parts, typeDoc, [" "]);
  parts.push(join(concat([",", line]), initDocs));
  return groupIndentConcat(parts);
}

function handleForInit(path: AstPath, print: any) {
  // This is one of the weird cases that does not really match the way that we print things.
  // ForInit is used by both C style for loop and enhanced for loop, and there's no way to tell
  // which operator we should use for init in this context, for example:
  // for (Integer i = [SELECT COUNT() FROM Contact; i++; i < 10)
  // and
  // for (Contact a: [SELECT Id FROM Contact])
  // have very little differentiation from the POV of the ForInit handler.
  // Therefore, we'll return 2 docs here so the parent can decide what operator to insert between them.
  const nameDocs: Doc[] = path.map(print, "name");

  const parts: Doc[] = [];
  parts.push(join(".", nameDocs));
  parts.push(path.call(print, "expr", "value"));
  return parts;
}

const nodeHandler = {};
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.IF_ELSE_BLOCK] = handleIfElseBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.IF_BLOCK] = handleIfBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ELSE_BLOCK] = handleElseBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.EXPRESSION_STATEMENT] = handleExpressionStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.RETURN_STATEMENT] = handleReturnStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TRIGGER_USAGE] = (path: AstPath, print: any) =>
  TRIGGER_USAGE[path.call(print, "$") as keyof typeof TRIGGER_USAGE];
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.JAVA_TYPE_REF] = handleJavaTypeRef;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CLASS_TYPE_REF] = handleClassTypeRef;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ARRAY_TYPE_REF] = handleArrayTypeRef;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.LOCATION_IDENTIFIER] = _handlePassthroughCall("value");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.MODIFIER_PARAMETER_REF] = handleModifierParameterRef;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.EMPTY_MODIFIER_PARAMETER_REF] =
  handleEmptyModifierParameterRef;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BLOCK_STATEMENT] = handleBlockStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.VARIABLE_DECLARATION_STATEMENT] =
  _handlePassthroughCall("variableDecls");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.VARIABLE_DECLARATIONS] = handleVariableDeclarations;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NAME_VALUE_PARAMETER] = handleNameValueParameter;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ANNOTATION] = handleAnnotation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ANNOTATION_KEY_VALUE] = handleAnnotationKeyValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ANNOTATION_VALUE] = handleAnnotationValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ANNOTATION_STRING] = handleAnnotationString;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.MODIFIER] = handleModifier;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.RUN_AS_BLOCK] = handleRunAsBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DO_LOOP] = handleDoLoop;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHILE_LOOP] = handleWhileLoop;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FOR_LOOP] = handleForLoop;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FOR_C_STYLE_CONTROL] = handleForCStyleControl;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FOR_ENHANCED_CONTROL] = handleForEnhancedControl;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FOR_INITS] = handleForInits;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FOR_INIT] = handleForInit;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BREAK_STATEMENT] = () => "break;";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CONTINUE_STATEMENT] = () => "continue;";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.THROW_STATEMENT] = (path: AstPath, print: any) =>
  concat(["throw", " ", path.call(print, "expr"), ";"]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TRY_CATCH_FINALLY_BLOCK] = handleTryCatchFinallyBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CATCH_BLOCK] = handleCatchBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FINALLY_BLOCK] = handleFinallyBlock;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.STATEMENT] = handleStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DML_MERGE_STATEMENT] = handleDmlMergeStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SWITCH_STATEMENT] = handleSwitchStatement;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.VALUE_WHEN] = handleValueWhen;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ELSE_WHEN] = handleElseWhen;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TYPE_WHEN] = handleTypeWhen;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ENUM_CASE] = handleEnumCase;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.LITERAL_CASE] = _handlePassthroughCall("expr");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PROPERTY_DECLATION] = handlePropertyDeclaration;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PROPERTY_GETTER] = _handlePropertyGetterSetter("get");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PROPERTY_SETTER] = _handlePropertyGetterSetter("set");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.STRUCTURED_VERSION] = handleStructuredVersion;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.REQUEST_VERSION] = () => "Request";
(nodeHandler as any).int = (path: AstPath, print: any) => path.call(print, "$");
(nodeHandler as any).string = (path: AstPath, print: any) =>
  concat(["'", path.call(print, "$"), "'"]);

// Operator
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ASSIGNMENT_OPERATOR] = handleAssignmentOperation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BINARY_OPERATOR] = handleBinaryOperation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BOOLEAN_OPERATOR] = handleBooleanOperation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.POSTFIX_OPERATOR] = handlePostfixOperator;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PREFIX_OPERATOR] = handlePrefixOperator;

// Declaration
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CLASS_DECLARATION] = handleClassDeclaration;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INTERFACE_DECLARATION] = handleInterfaceDeclaration;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.METHOD_DECLARATION] = handleMethodDeclaration;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.VARIABLE_DECLARATION] = handleVariableDeclaration;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ENUM_DECLARATION] = handleEnumDeclaration;

// Compilation Unit: we're not handling  InvalidDeclUnit
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TRIGGER_DECLARATION_UNIT] = handleTriggerDeclarationUnit;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CLASS_DECLARATION_UNIT] = _handlePassthroughCall("body");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ENUM_DECLARATION_UNIT] = _handlePassthroughCall("body");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INTERFACE_DECLARATION_UNIT] =
  _handlePassthroughCall("body");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ANONYMOUS_BLOCK_UNIT] = handleAnonymousBlockUnit;

// Block Member
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PROPERTY_MEMBER] =
  _handlePassthroughCall("propertyDecl");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FIELD_MEMBER] = _handlePassthroughCall("variableDecls");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.STATEMENT_BLOCK_MEMBER] = _handleStatementBlockMember();
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.STATIC_STATEMENT_BLOCK_MEMBER] =
  _handleStatementBlockMember("static");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.METHOD_MEMBER] = _handlePassthroughCall("methodDecl");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INNER_CLASS_MEMBER] = _handlePassthroughCall("body");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INNER_ENUM_MEMBER] = _handlePassthroughCall("body");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INNER_INTERFACE_MEMBER] = _handlePassthroughCall("body");

// Expression
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TERNARY_EXPRESSION] = handleTernaryExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BOOLEAN_EXPRESSION] = handleBinaryishExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ASSIGNMENT_EXPRESSION] = handleAssignmentExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NESTED_EXPRESSION] = handleNestedExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.VARIABLE_EXPRESSION] = handleVariableExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.JAVA_VARIABLE_EXPRESSION] = handleJavaVariableExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.LITERAL_EXPRESSION] = handleLiteralExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BINARY_EXPRESSION] = handleBinaryishExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TRIGGER_VARIABLE_EXPRESSION] = (
  path: AstPath,
  print: any,
) => concat(["Trigger", ".", path.call(print, "variable")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_EXPRESSION] = handleNewExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.METHOD_CALL_EXPRESSION] = handleMethodCallExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.JAVA_METHOD_CALL_EXPRESSION] =
  handleJavaMethodCallExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.THIS_VARIABLE_EXPRESSION] = () => "this";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SUPER_VARIABLE_EXPRESSION] = () => "super";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.POSTFIX_EXPRESSION] = handlePostfixExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PREFIX_EXPRESSION] = handlePrefixExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CAST_EXPRESSION] = handleCastExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.INSTANCE_OF_EXPRESSION] = handleInstanceOfExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.PACKAGE_VERSION_EXPRESSION] =
  handlePackageVersionExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ARRAY_EXPRESSION] = handleArrayExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CLASS_REF_EXPRESSION] = (path: AstPath, print: any) =>
  concat([path.call(print, "type"), ".", "class"]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.THIS_METHOD_CALL_EXPRESSION] =
  handleThisMethodCallExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SUPER_METHOD_CALL_EXPRESSION] =
  handleSuperMethodCallExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SOQL_EXPRESSION] = handleSoqlExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SOSL_EXPRESSION] = handleSoslExpression;

// New Object Init
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_SET_INIT] = handleNewSetInit;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_SET_LITERAL] = handleNewSetLiteral;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_LIST_INIT] = handleNewListInit;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_MAP_INIT] = handleNewMapInit;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_MAP_LITERAL] = handleNewMapLiteral;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.MAP_LITERAL_KEY_VALUE] = handleMapLiteralKeyValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_LIST_LITERAL] = handleNewListLiteral;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_STANDARD] = handleNewStandard;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NEW_KEY_VALUE] = handleNewKeyValue;

// SOSL
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SEARCH] = handleSearch;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FIND_CLAUSE] = handleFindClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FIND_VALUE] = handleFindValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.IN_CLAUSE] = handleInClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WITH_DIVISION_CLAUSE] = handleDivisionClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DIVISION_VALUE] = handleDivisionValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WITH_DATA_CATEGORY_CLAUSE] = handleWithDataCategories;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SEARCH_WITH_CLAUSE] = handleSearchWithClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SEARCH_WITH_CLAUSE_VALUE] = handleSearchWithClauseValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.RETURNING_CLAUSE] = handleReturningClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.RETURNING_EXPRESSION] = handleReturningExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.RETURNING_SELECT_EXPRESSION] =
  handleReturningSelectExpression;

// SOQL
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY] = handleQuery;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_COLUMN_CLAUSE] = handleColumnClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_COUNT_CLAUSE] = () =>
  concat(["SELECT", " ", "COUNT()"]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_COLUMN_EXPRESSION] = handleColumnExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_INNER_QUERY] = handleSelectInnerQuery;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_CASE_EXPRESSION] = _handlePassthroughCall("expr");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CASE_EXPRESSION] = handleCaseExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHEN_OPERATOR] = _handlePassthroughCall("identifier");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHEN_EXPRESSION] = handleWhenExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.CASE_OPERATOR] = _handlePassthroughCall("identifier");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ELSE_EXPRESSION] = handleElseExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FIELD] = handleField;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FIELD_IDENTIFIER] = handleFieldIdentifier;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FROM_CLAUSE] = handleFromClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.FROM_EXPRESSION] = handleFromExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.GROUP_BY_CLAUSE] = handleGroupByClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.GROUP_BY_EXPRESSION] = _handlePassthroughCall("field");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.GROUP_BY_TYPE] = handleGroupByType;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.HAVING_CLAUSE] = handleHavingClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_CLAUSE] = handleWhereClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_INNER_EXPRESSION] = handleWhereInnerExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_OPERATION_EXPRESSION] =
  handleWhereOperationExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_OPERATION_EXPRESSIONS] =
  handleWhereOperationExpressions;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_COMPOUND_EXPRESSION] =
  handleWhereCompoundExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_UNARY_EXPRESSION] = handleWhereUnaryExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_UNARY_OPERATOR] = () => "NOT";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SELECT_DISTANCE_EXPRESSION] =
  handleSelectDistanceExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_DISTANCE_EXPRESSION] =
  handleWhereDistanceExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DISTANCE_FUNCTION_EXPRESSION] =
  handleDistanceFunctionExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.GEOLOCATION_LITERAL] = handleGeolocationLiteral;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NUMBER_LITERAL] = _handlePassthroughCall("number", "$");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.NUMBER_EXPRESSION] = _handlePassthroughCall("expr");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY_LITERAL_EXPRESSION] =
  _handlePassthroughCall("literal");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY_LITERAL] = handleWhereQueryLiteral;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.APEX_EXPRESSION] = _handlePassthroughCall("expr");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.COLON_EXPRESSION] = handleColonExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ORDER_BY_CLAUSE] = handleOrderByClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.ORDER_BY_EXPRESSION] = handleOrderByExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WITH_VALUE] = handleWithValue;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WITH_DATA_CATEGORIES] = handleWithDataCategories;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DATA_CATEGORY] = handleDataCategory;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.DATA_CATEGORY_OPERATOR] = handleDataCategoryOperator;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.LIMIT_VALUE] = (path: AstPath, print: any) =>
  concat(["LIMIT", " ", path.call(print, "i")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.LIMIT_EXPRESSION] = (path: AstPath, print: any) =>
  concat(["LIMIT", " ", path.call(print, "expr")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.OFFSET_VALUE] = (path: AstPath, print: any) =>
  concat(["OFFSET", " ", path.call(print, "i")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.OFFSET_EXPRESSION] = (path: AstPath, print: any) =>
  concat(["OFFSET", " ", path.call(print, "expr")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY_OPERATOR] = (childClass: any) => QUERY[childClass];
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SOQL_ORDER] = handleOrderOperation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SOQL_ORDER_NULL] = handleNullOrderOperation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.TRACKING_TYPE] = handleTrackingType;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY_OPTION] = handleQueryOption;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.QUERY_USING_CLAUSE] = handleQueryUsingClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.USING_EXPRESSION] = handleUsingExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.UPDATE_STATS_CLAUSE] = handleUpdateStatsClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.UPDATE_STATS_OPTION] = handleUpdateStatsOption;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_CALC_EXPRESSION] = handleWhereCalcExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_CALC_OPERATOR_PLUS] = () => "+";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_CALC_OPERATOR_MINUS] = () => "-";
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WHERE_COMPOUND_OPERATOR] = (
  childClass: keyof typeof QUERY_WHERE,
) => QUERY_WHERE[childClass];
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.SEARCH_USING_CLAUSE] = (path: AstPath, print: any) =>
  concat(["USING", " ", path.call(print, "type")]);
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.USING_TYPE] = handleUsingType;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BIND_CLAUSE] = handleBindClause;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.BIND_EXPRESSION] = handleBindExpression;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
nodeHandler[APEX_TYPES.WITH_IDENTIFIER] = (path: AstPath, print: any) =>
  concat(["WITH", " ", path.call(print, "identifier")]);

function handleTrailingEmptyLines(doc: any, node: any) {
  let insertNewLine = false;
  if (node && node.trailingEmptyLine) {
    if (node.comments) {
      const trailingComments = getTrailingComments(node);
      if (trailingComments.length === 0) {
        insertNewLine = true;
      } else {
        trailingComments[trailingComments.length - 1].trailingEmptyLine = true;
      }
    } else {
      insertNewLine = true;
    }
  }
  if (insertNewLine) {
    return concat([doc, hardline]);
  }
  return doc;
}

function genericPrint(path: AstPath, options: any, print: any) {
  const n = path.getValue();
  if (typeof n === "number" || typeof n === "boolean") {
    return n.toString();
  }
  if (typeof n === "string") {
    return _escapeString(n);
  }
  if (!n) {
    return "";
  }
  const apexClass = n["@class"];
  if (path.stack.length === 1) {
    // Hard code how to handle the root node here
    const docs = [];
    docs.push(path.call(print, APEX_TYPES.PARSER_OUTPUT, "unit"));
    // Optionally, adding a hardline as the last thing in the document
    if (options.apexInsertFinalNewline) {
      docs.push(hardline);
    }

    return concat(docs);
  }
  if (!apexClass) {
    return "";
  }
  if (apexClass in nodeHandler) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return nodeHandler[apexClass](path, print, options);
  }
  const separatorIndex = apexClass.indexOf("$");
  if (separatorIndex !== -1) {
    const parentClass = apexClass.substring(0, separatorIndex);
    const childClass = apexClass.substring(separatorIndex + 1);
    if (parentClass in nodeHandler) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      return nodeHandler[parentClass](childClass, path, print, options);
    }
  }
  throw new Error(
    `No handler found for ${apexClass}. Please file a bug report.`,
  );
}

let options: any;
export default function printGenerically(
  path: AstPath,
  opts: any,
  print: any,
): Doc {
  if (typeof opts === "object") {
    options = opts;
  }
  const node = path.getValue();
  const doc = genericPrint(path, options, print);
  return handleTrailingEmptyLines(doc, node);
}
