import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { Scanner } from "@tailwindcss/oxide";
import { compile, optimize } from "@tailwindcss/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

async function main() {
  await fs.mkdir(dist, { recursive: true });

  execFileSync(
    "cmd.exe",
    [
      "/c",
      path.join(root, "node_modules", ".bin", "esbuild.cmd"),
      path.join(root, "src", "static-main.tsx"),
      "--bundle",
      "--format=esm",
      "--platform=browser",
      "--target=es2020",
      "--loader:.png=dataurl",
      `--outfile=${path.join(dist, "app.js")}`,
      "--minify",
    ],
    { stdio: "inherit" }
  );

  const scanner = new Scanner({
    sources: [
      {
        base: root,
        pattern: "src/**/*.{ts,tsx,js,jsx,html}",
        negated: false,
      },
    ],
  });
  const candidates = scanner.scan();

  const cssSource = await fs.readFile(path.join(root, "src", "index.css"), "utf8");
  const compiled = await compile(cssSource, {
    base: root,
    from: path.join(root, "src", "index.css"),
    onDependency: () => {},
  });
  const generatedCss = compiled.build(candidates);
  const optimizedCss = optimize(generatedCss, {
    file: "style.css",
    minify: true,
  }).code;
  await fs.writeFile(path.join(dist, "style.css"), optimizedCss, "utf8");

  const html = await fs.readFile(path.join(root, "index.html"), "utf8");
  const distHtml = html
    .replace('/boot.js', './boot.js')
    .replace('/favicon.svg', './favicon.svg');
  await fs.writeFile(path.join(dist, "index.html"), distHtml, "utf8");

  await fs.copyFile(path.join(root, "favicon.svg"), path.join(dist, "favicon.svg"));
  await fs.copyFile(path.join(root, "boot.js"), path.join(dist, "boot.js"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
