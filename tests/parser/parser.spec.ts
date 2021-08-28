// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prettier'.
const prettier = require("prettier");

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Parser Tests", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("runs synchronous parser on valid class correctly", () => {
    const fileName = path.join(__dirname, "ValidClass.cls");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    const output = prettier.format(source, {
      plugins: ["."],
      filepath: fileName,
      parser: "apex",
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(output).toBeDefined();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("runs synchronous parser on valid anonymous block correctly", () => {
    const fileName = path.join(__dirname, "ValidAnonymousBlock.apex");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    const output = prettier.format(source, {
      plugins: ["."],
      filepath: fileName,
      parser: "apex-anonymous",
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(output).toBeDefined();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("runs asynchronous parser correctly", () => {
    const fileName = path.join(__dirname, "ValidClass.cls");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    const output = prettier.format(source, {
      plugins: ["."],
      filepath: fileName,
      parser: "apex",
      apexStandaloneParser: "built-in",
      apexStandalonePort: 2117,
      apexStandaloneHost: "localhost",
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(output).toBeDefined();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws error when asynchronous parser server cannot be reached", () => {
    const fileName = path.join(__dirname, "ValidClass.cls");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() =>
      prettier.format(source, {
        plugins: ["."],
        filepath: fileName,
        parser: "apex",
        apexStandaloneParser: "built-in",
        apexStandalonePort: 2118,
        apexStandaloneHost: "localhost",
      }),
    ).toThrow("Failed to connect to Apex parsing server");
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws error when synchronous parser runs into invalid input file", () => {
    const fileName = path.join(__dirname, "InvalidClass.cls");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() =>
      prettier.format(source, {
        plugins: ["."],
        filepath: fileName,
        parser: "apex",
      }),
    ).toThrow("Unexpected token");
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws error when asynchronous parser runs into invalid input file", () => {
    const fileName = path.join(__dirname, "InvalidClass.cls");
    const source = fs.readFileSync(fileName, "utf8").replace(/\r\n/g, "\n");
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() =>
      prettier.format(source, {
        plugins: ["."],
        filepath: fileName,
        parser: "apex",
        apexStandaloneParser: "built-in",
        apexStandalonePort: 2117,
        apexStandaloneHost: "localhost",
      }),
    ).toThrow("Unexpected token");
  });
});
