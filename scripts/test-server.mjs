import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";

export async function startTestServer() {
  if (process.env.TEST_BASE_URL) {
    return { origin: process.env.TEST_BASE_URL, stop: async () => {} };
  }
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "-H",
      "127.0.0.1",
      "-p",
      String(port),
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  const stop = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exited = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    await exited;
  };
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Next.js failed to start: ${output}`);
    try {
      const response = await fetch(origin + "/");
      if (response.ok) return { origin, stop };
    } catch {
      /* Wait for the production server to bind. */
    }
    await setTimeout(500);
  }
  await stop();
  throw new Error(
    `Next.js did not become ready. Run npm run build first.\n${output}`,
  );
}
