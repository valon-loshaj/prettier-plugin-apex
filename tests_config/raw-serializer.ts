const RAW = Symbol.for("raw");

module.exports = {
  print(val: any) {
    return val[RAW];
  },
  test(val: any) {
    return (
      val &&
      Object.prototype.hasOwnProperty.call(val, RAW) &&
      typeof val[RAW] === "string"
    );
  },
};
