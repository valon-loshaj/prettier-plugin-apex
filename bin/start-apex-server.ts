#!/usr/bin/env node
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'httpServer... Remove this comment to see the full error message
const httpServer = require("../src/http-server");

async function setup() {
  await httpServer.start("localhost", 2117);
}

if (require.main === module) {
  // Support calling this directly
  setup();
}

module.exports = setup;
