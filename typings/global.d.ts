import prettier from "prettier";

declare module "prettier" {
  interface RequiredOptions {
    apexStandaloneParser: string;
    apexStandalonePort: number;
    apexStandaloneHost: string;
    apexInsertFinalNewline: boolean;
  }
}
