/* eslint no-param-reassign: 0 no-underscore-dangle: 0 */
import childProcess, { spawnSync } from "child_process";
import path from "path";

import {
  findNextUncommentedCharacter,
  getSerializerBinDirectory,
} from "./util";
import {
  APEX_TYPES,
  ALLOW_TRAILING_EMPTY_LINE,
  TRAILING_EMPTY_LINE_AFTER_LAST_NODE,
} from "./constants";

const MAX_BUFFER = 8192 * 8192;

function parseTextWithSpawn(text: any, anonymous: any) {
  let serializerBin = getSerializerBinDirectory();
  if (process.platform === "win32") {
    serializerBin = path.join(serializerBin, "apex-ast-serializer.bat");
  } else {
    serializerBin = path.join(serializerBin, "apex-ast-serializer");
  }
  const args = ["-f", "json", "-i"];
  if (anonymous) {
    args.push("-a");
  }
  const executionResult = spawnSync(serializerBin, args, {
    input: text,
    maxBuffer: MAX_BUFFER,
  });

  const executionError = executionResult.error;

  if (executionError) {
    throw executionError;
  }
  if (executionResult.status !== 0) {
    throw new Error(executionResult.stdout.toString());
  }

  return executionResult.stdout.toString();
}

function parseTextWithHttp(
  text: any,
  serverHost: any,
  serverPort: any,
  anonymous: any,
) {
  const httpClientLocation = path.join(__dirname, "http-client.js");
  const args = [
    httpClientLocation,
    "-a",
    serverHost,
    "-f",
    "json",
    "-p",
    serverPort,
  ];
  if (anonymous) {
    args.push("-n");
  }
  const executionResult = childProcess.spawnSync(process.argv[0], args, {
    input: text,
    maxBuffer: MAX_BUFFER,
  });

  if (executionResult.status) {
    const executionError = `Failed to connect to Apex parsing server\r\n${executionResult.stderr.toString()}`;
    throw new Error(executionError);
  }

  return executionResult.stdout.toString();
}

// jorje calls the location node differently for different types of nodes,
// so we use this method to abstract away that difference
function _getNodeLocation(node: any) {
  if (node.loc) {
    return node.loc;
  }
  if (node.location) {
    return node.location;
  }
  return null;
}

// The serialized string given back contains references (to avoid circular references),
// which need to be resolved. This method recursively walks through the
// deserialized object and resolve those references.
function resolveAstReferences(node: any, referenceMap: any) {
  const nodeId = node["@id"];
  const nodeReference = node["@reference"];
  if (nodeId) {
    referenceMap[nodeId] = node;
  }
  if (nodeReference) {
    // If it has a reference attribute, that means it's a leaf node
    return referenceMap[nodeReference];
  }
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === "object") {
      node[key] = resolveAstReferences(node[key], referenceMap);
    }
  });
  return node;
}

function handleNodeSurroundedByCharacters(
  startCharacter: any,
  endCharacter: any,
) {
  return (location: any, sourceCode: any, commentNodes: any) => {
    const resultLocation = {};
    (resultLocation as any).startIndex = findNextUncommentedCharacter(
      sourceCode,
      startCharacter,
      location.startIndex,
      commentNodes,
      /* backwards */ true,
    );
    (resultLocation as any).endIndex =
      findNextUncommentedCharacter(
        sourceCode,
        endCharacter,
        location.startIndex,
        commentNodes,
        /* backwards */ false,
      ) + 1;
    return resultLocation;
  };
}

function handleNodeStartedWithCharacter(startCharacter: any) {
  return (location: any, sourceCode: any, commentNodes: any) => {
    const resultLocation = {};
    (resultLocation as any).startIndex = findNextUncommentedCharacter(
      sourceCode,
      startCharacter,
      location.startIndex,
      commentNodes,
      /* backwards */ true,
    );
    (resultLocation as any).endIndex = location.endIndex;
    return resultLocation;
  };
}

function handleNodeEndedWithCharacter(endCharacter: any) {
  return (location: any, sourceCode: any, commentNodes: any) => {
    const resultLocation = {};
    (resultLocation as any).startIndex = location.startIndex;
    (resultLocation as any).endIndex =
      findNextUncommentedCharacter(
        sourceCode,
        endCharacter,
        location.endIndex,
        commentNodes,
        /* backwards */ false,
      ) + 1;
    return resultLocation;
  };
}

function handleAnonymousUnitLocation(location: any, sourceCode: any) {
  return {
    startIndex: 0,
    endIndex: sourceCode.length,
  };
}

function handleMethodDeclarationLocation(
  location: any,
  sourceCode: any,
  commentNodes: any,
  node: any,
) {
  // This is a method declaration with a body, so we can safely use the identity
  // location.
  if (node.stmnt.value) {
    return location;
  }
  // This is a Method Declaration with no body, in which case we need to use the
  // position of the closing parenthesis for the input parameters, e.g:
  // void method();
  return handleNodeEndedWithCharacter(")")(location, sourceCode, commentNodes);
}

function handleAnnotationLocation(
  location: any,
  sourceCode: any,
  commentNodes: any,
  node: any,
) {
  // This is an annotation without parameters, so we only need to worry about
  // the starting character
  if (!node.parameters || node.parameters.length === 0) {
    return handleNodeStartedWithCharacter("@")(
      location,
      sourceCode,
      commentNodes,
    );
  }
  // If not, we need to use the position of the closing parenthesis after the
  // parameters as well
  return handleNodeSurroundedByCharacters("@", ")")(
    location,
    sourceCode,
    commentNodes,
  );
}

// We need to generate the location for a node differently based on the node
// type. This object holds a String => Function mapping in order to do that.
const locationGenerationHandler = {};
const identityFunction = (location: any) => location;
// Sometimes we need to delete a location node. For example, a WhereCompoundOp
// location does not make sense since it can appear in multiple places:
// SELECT Id FROM Account
// WHERE Name = 'Name'
// AND Name = 'Other Name' // <- this AND node here
// AND Name = 'Yet Another Name' <- this AND node here
// If we keep those locations, a comment might be duplicated since it is
// attached to one WhereCompoundOp, and that operator is printed multiple times.
const removeFunction = () => null;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.QUERY] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.VARIABLE_EXPRESSION] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.INNER_CLASS_MEMBER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.INNER_INTERFACE_MEMBER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.INNER_ENUM_MEMBER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.METHOD_MEMBER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.IF_ELSE_BLOCK] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NAME_VALUE_PARAMETER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.VARIABLE_DECLARATION] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.BINARY_EXPRESSION] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.BOOLEAN_EXPRESSION] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.ASSIGNMENT_EXPRESSION] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.FIELD_MEMBER] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.VALUE_WHEN] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.ELSE_WHEN] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.QUERY] = identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.WHERE_COMPOUND_OPERATOR] = removeFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.VARIABLE_DECLARATION_STATEMENT] =
  identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.WHERE_COMPOUND_EXPRESSION] =
  identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.WHERE_OPERATION_EXPRESSION] =
  identityFunction;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.SELECT_INNER_QUERY] =
  handleNodeSurroundedByCharacters("(", ")");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.ANONYMOUS_BLOCK_UNIT] =
  handleAnonymousUnitLocation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NESTED_EXPRESSION] =
  handleNodeSurroundedByCharacters("(", ")");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.PROPERTY_MEMBER] =
  handleNodeEndedWithCharacter("}");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.SWITCH_STATEMENT] =
  handleNodeEndedWithCharacter("}");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NEW_LIST_LITERAL] =
  handleNodeEndedWithCharacter("}");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NEW_SET_LITERAL] =
  handleNodeEndedWithCharacter("}");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NEW_MAP_LITERAL] =
  handleNodeEndedWithCharacter("}");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NEW_STANDARD] =
  handleNodeEndedWithCharacter(")");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.VARIABLE_DECLARATIONS] =
  handleNodeEndedWithCharacter(";");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.NEW_KEY_VALUE] =
  handleNodeEndedWithCharacter(")");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.METHOD_CALL_EXPRESSION] =
  handleNodeEndedWithCharacter(")");
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.ANNOTATION] = handleAnnotationLocation;
// @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
locationGenerationHandler[APEX_TYPES.METHOD_DECLARATION] =
  handleMethodDeclarationLocation;

/**
 * Generate and/or fix node locations, because jorje sometimes either provides
 * wrong location information or a node, or doesn't provide any information at
 * all.
 * We will fix it here by enforcing that a parent node start
 * index is always <= any child node start index, and a parent node end index
 * is always >= any child node end index.
 * @param node the node being visited.
 * @param sourceCode the entire source code.
 * @param commentNodes all the comment nodes.
 * @return the corrected node.
 */
function handleNodeLocation(node: any, sourceCode: any, commentNodes: any) {
  let currentLocation: any;
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === "object") {
      const location = handleNodeLocation(node[key], sourceCode, commentNodes);
      if (location && currentLocation) {
        if (currentLocation.startIndex > location.startIndex) {
          currentLocation.startIndex = location.startIndex;
        }
        if (currentLocation.endIndex < location.endIndex) {
          currentLocation.endIndex = location.endIndex;
        }
      }
      if (location && !currentLocation) {
        currentLocation = location;
      }
    }
  });

  const apexClass = node["@class"];
  let handlerFn;
  if (apexClass) {
    const separatorIndex = apexClass.indexOf("$");
    if (separatorIndex !== -1) {
      const parentClass = apexClass.substring(0, separatorIndex);
      if (parentClass in locationGenerationHandler) {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        handlerFn = locationGenerationHandler[parentClass];
      }
    }
    if (apexClass in locationGenerationHandler) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      handlerFn = locationGenerationHandler[apexClass];
    }
  }
  if (handlerFn && currentLocation) {
    node.loc = handlerFn(currentLocation, sourceCode, commentNodes, node);
  } else if (handlerFn && node.loc) {
    node.loc = handlerFn(node.loc, sourceCode, commentNodes, node);
  }
  if (!node.loc) {
    delete node.loc;
  }
  if (node.loc && currentLocation) {
    if (node.loc.startIndex > currentLocation.startIndex) {
      node.loc.startIndex = currentLocation.startIndex;
    } else {
      currentLocation.startIndex = node.loc.startIndex;
    }
    if (node.loc.endIndex < currentLocation.endIndex) {
      node.loc.endIndex = currentLocation.endIndex;
    } else {
      currentLocation.endIndex = node.loc.endIndex;
    }
  }
  if (currentLocation) {
    return { ...currentLocation };
  }
  if (node.loc) {
    return {
      startIndex: node.loc.startIndex,
      endIndex: node.loc.endIndex,
    };
  }
  return null;
}

/**
 * Generate metadata about empty lines for statement nodes.
 * This method is called recursively while visiting each node in the tree.
 *
 * @param node the node being visited
 * @param emptyLineLocations a list of lines that are empty in the source code
 * @param allowTrailingEmptyLine whether trailing empty line is allowed
 * for this node. This helps when dealing with statements that contain other
 * statements. For example, we turn this to `false` for the block statements
 * inside an IfElseBlock
 *
 */
function generateExtraMetadata(
  node: any,
  emptyLineLocations: number[],
  allowTrailingEmptyLine: any,
) {
  const apexClass = node["@class"];
  let allowTrailingEmptyLineWithin: any;
  const isSpecialClass =
    TRAILING_EMPTY_LINE_AFTER_LAST_NODE.includes(apexClass);
  const trailingEmptyLineAllowed =
    ALLOW_TRAILING_EMPTY_LINE.includes(apexClass);
  if (isSpecialClass) {
    allowTrailingEmptyLineWithin = false;
  } else if (trailingEmptyLineAllowed) {
    allowTrailingEmptyLineWithin = true;
  } else {
    allowTrailingEmptyLineWithin = allowTrailingEmptyLine;
  }
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === "object") {
      if (Array.isArray(node)) {
        const keyInt = parseInt(key, 10);
        if (keyInt === node.length - 1) {
          // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
          node[key].isLastNodeInArray = true; // So that we don't apply trailing empty line after this node
        } else {
          // Here we flag a node if its next sibling is on the same line.
          // The reasoning is that for a block of code like this:
          // ```
          // Integer a = 1; Integer c = 2; Integer c = 3;
          //
          // Integer d = 4;
          // ```
          // We don't want a trailing empty line after `Integer a = 1;`
          // so we need to mark it as a special node.
          const currentChildNode = node[keyInt];
          const nextChildNode = node[keyInt + 1];
          if (
            nextChildNode &&
            nextChildNode.loc &&
            currentChildNode.loc &&
            nextChildNode.loc.startLine === currentChildNode.loc.endLine
          ) {
            node[keyInt].isNextStatementOnSameLine = true;
          }
        }
      }
      generateExtraMetadata(
        node[key],
        emptyLineLocations,
        allowTrailingEmptyLineWithin,
      );
    }
  });

  const nodeLoc = _getNodeLocation(node);
  if (
    apexClass &&
    nodeLoc &&
    allowTrailingEmptyLine &&
    !node.isLastNodeInArray &&
    !node.isNextStatementOnSameLine
  ) {
    const nextLine = nodeLoc.endLine + 1;
    const nextEmptyLine = emptyLineLocations.indexOf(nextLine);
    if (trailingEmptyLineAllowed && nextEmptyLine !== -1) {
      node.trailingEmptyLine = true;
    }
  }
  return nodeLoc;
}

// For each node, the jorje compiler gives us its line and its index within
// that line; however we use this method to resolve that line index to a global
// index of that node within the source code. That allows us to use prettier
// utility methods.
function resolveLineIndexes(node: any, lineIndexes: any) {
  const nodeLoc = _getNodeLocation(node);
  if (nodeLoc && !("startLine" in nodeLoc)) {
    // The location node that we manually generate do not contain startLine
    // information, so we will create them here.
    nodeLoc.startLine =
      lineIndexes.findIndex((index: any) => index > nodeLoc.startIndex) - 1;
  }
  if (nodeLoc && !("endLine" in nodeLoc)) {
    nodeLoc.endLine =
      lineIndexes.findIndex((index: any) => index > nodeLoc.endIndex) - 1;

    // Edge case: root node
    if (nodeLoc.endLine < 0) {
      nodeLoc.endLine = lineIndexes.length - 1;
    }
  }
  if (nodeLoc && !("column" in nodeLoc)) {
    nodeLoc.column =
      nodeLoc.startIndex -
      lineIndexes[
        lineIndexes.findIndex((index: any) => index > nodeLoc.startIndex) - 1
      ];
  }
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === "object") {
      node[key] = resolveLineIndexes(node[key], lineIndexes);
    }
  });
  return node;
}
// Get a map of line number to the index of its first character
function getLineIndexes(sourceCode: any) {
  // First line always start with index 0
  const lineIndexes = [0, 0];
  let characterIndex = 0;
  let lineIndex = 2;
  while (characterIndex < sourceCode.length) {
    const eolIndex = sourceCode.indexOf("\n", characterIndex);
    if (eolIndex < 0) {
      break;
    }
    lineIndexes[lineIndex] =
      lineIndexes[lineIndex - 1] +
      sourceCode.substring(characterIndex, eolIndex).length +
      1;
    characterIndex = eolIndex + 1;
    lineIndex += 1;
  }
  return lineIndexes;
}

function getEmptyLineLocations(sourceCode: any): number[] {
  const whiteSpaceRegEx = /^\s*$/;
  const lines = sourceCode.split("\n");
  return lines
    .map((line: any) => whiteSpaceRegEx.test(line))
    .reduce((accumulator: any, currentValue: any, currentIndex: any) => {
      if (currentValue) {
        accumulator.push(currentIndex + 1);
      }
      return accumulator;
    }, []);
}

export default function parse(sourceCode: any, _: any, options: any): any {
  const lineIndexes = getLineIndexes(sourceCode);
  let serializedAst;
  if (options.apexStandaloneParser === "built-in") {
    serializedAst = parseTextWithHttp(
      sourceCode,
      options.apexStandaloneHost,
      options.apexStandalonePort,
      options.parser === "apex-anonymous",
    );
  } else {
    serializedAst = parseTextWithSpawn(
      sourceCode,
      options.parser === "apex-anonymous",
    );
  }
  let ast = {};
  if (serializedAst) {
    ast = JSON.parse(serializedAst);
    if (
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ast[APEX_TYPES.PARSER_OUTPUT] &&
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ast[APEX_TYPES.PARSER_OUTPUT].parseErrors.length > 0
    ) {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      const errors = ast[APEX_TYPES.PARSER_OUTPUT].parseErrors.map(
        (err: any) => `${err.message}. ${err.detailMessage}`,
      );
      throw new Error(errors.join("\r\n"));
    }
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    const commentNodes = ast[APEX_TYPES.PARSER_OUTPUT].hiddenTokenMap
      .map((item: any) => item[1])
      .filter(
        (node: any) =>
          node["@class"] === APEX_TYPES.BLOCK_COMMENT ||
          node["@class"] === APEX_TYPES.INLINE_COMMENT,
      );
    ast = resolveAstReferences(ast, {});
    handleNodeLocation(ast, sourceCode, commentNodes);
    ast = resolveLineIndexes(ast, lineIndexes);

    generateExtraMetadata(ast, getEmptyLineLocations(sourceCode), true);
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (ast as any).comments = ast[APEX_TYPES.PARSER_OUTPUT].hiddenTokenMap
      .map((token: any) => token[1])
      .filter(
        (node: any) =>
          node["@class"] === APEX_TYPES.INLINE_COMMENT ||
          node["@class"] === APEX_TYPES.BLOCK_COMMENT,
      );
  }
  return ast;
}
