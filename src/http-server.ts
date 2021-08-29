import { spawn } from "child_process";
import path from "path";
import util from "util";

import axios from "axios";
import waitOn from "wait-on";

const waitOnPromise = util.promisify(waitOn);

async function start(address: any, port: any) {
  let serializerBin = path.join(
    __dirname,
    "../../vendor/apex-ast-serializer/bin",
  );
  if (process.platform === "win32") {
    serializerBin = path.join(serializerBin, "apex-ast-serializer-http.bat");
  } else {
    serializerBin = path.join(serializerBin, "apex-ast-serializer-http");
  }
  const command = spawn(serializerBin, ["-s", "-a", "secret"]);

  await waitOnPromise({
    resources: [`http://${address}:${port}/api/ast`],
  });

  return command;
}

async function stop(address: any, port: any) {
  return axios.post(`http://${address}:${port}/shutdown?token=secret`);
}

module.exports = {
  start,
  stop,
};
