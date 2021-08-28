// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
const { argv } = require("yargs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'axios'.
const axios = require("axios");

async function main() {
  const result = await axios.post(`http://${argv.a}:${argv.p}/api/ast`, {
    sourceCode: fs.readFileSync(0, "utf-8"),
    anonymous: argv.n ? argv.n : false,
    outputFormat: argv.f,
    idRef: true,
    prettyPrint: false,
  });
  console.log(JSON.stringify(result.data)); // eslint-disable-line no-console
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err.message);
  process.exit(1);
});
