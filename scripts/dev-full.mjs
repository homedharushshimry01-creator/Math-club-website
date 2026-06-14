import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const server = spawn("node", [path.join(root, "scripts", "server.mjs")], {
  stdio: "inherit",
  shell: true,
});

const vite = spawn(
  path.join(root, "node_modules", ".bin", "vite.cmd"),
  ["--config", "vite.config.js", "--configLoader", "native"],
  {
    cwd: root,
    stdio: "inherit",
    shell: true,
  }
);

function shutdown() {
  server.kill();
  vite.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
vite.on("exit", shutdown);
server.on("exit", shutdown);
