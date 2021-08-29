// @ts-expect-error runSpec needs to be defined
runSpec(
  __dirname,
  ["apex"],
  [
    { useTabs: false, tabWidth: 2 },
    { useTabs: false, tabWidth: 4 },
    { useTabs: true, tabWidth: 2 },
  ],
);
