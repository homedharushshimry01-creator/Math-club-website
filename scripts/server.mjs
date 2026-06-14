import { createReadStream, createWriteStream, promises as fs } from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const filesDir = path.join(dataDir, "files");
const dbPath = path.join(dataDir, "db.json");
const maxUploadBytes = 100 * 1024 * 1024;
const port = Number(process.env.PORT || 8787);

const defaultDb = {
  papers: [],
  submissions: [],
  uploads: {},
};

function uid() {
  return (
    Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
  );
}

async function ensureStorage() {
  await fs.mkdir(filesDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), "utf8");
  }
}

async function readDb() {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      papers: Array.isArray(parsed.papers) ? parsed.papers : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      uploads: parsed.uploads && typeof parsed.uploads === "object" ? parsed.uploads : {},
    };
  } catch {
    return structuredClone(defaultDb);
  }
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

let writeChain = Promise.resolve();
function mutateDb(mutator) {
  writeChain = writeChain.then(async () => {
    const db = await readDb();
    await mutator(db);
    await writeDb(db);
  });
  return writeChain;
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

function badRequest(res, message) {
  json(res, 400, { error: message });
}

function cloneReplyHistory(history) {
  return Array.isArray(history)
    ? history.map((item) => ({
        id: String(item.id || uid()),
        text: String(item.text || ""),
        createdAt: Number(item.createdAt || Date.now()),
      }))
    : [];
}

function enrichPaper(paper) {
  return {
    ...paper,
    fileDataUrl: paper.fileStorageId ? `/api/files/${paper.fileStorageId}` : "",
  };
}

function enrichSubmission(sub) {
  return {
    ...sub,
    fileDataUrl: sub.fileStorageId ? `/api/files/${sub.fileStorageId}` : "",
  };
}

async function removeStoredFile(storageId) {
  if (!storageId) return;
  const filePath = path.join(filesDir, storageId);
  await fs.rm(filePath, { force: true }).catch(() => {});
}

async function handleUpload(req, res) {
  const storageId = req.headers["x-storage-id"]
    ? String(req.headers["x-storage-id"])
    : uid();
  const fileName = decodeURIComponent(String(req.headers["x-file-name"] || "upload.bin"));
  const fileType = String(req.headers["content-type"] || "application/octet-stream");
  const filePath = path.join(filesDir, storageId);

  let size = 0;
  const out = createWriteStream(filePath);
  let done = false;

  const finish = async (status, body) => {
    if (done) return;
    done = true;
    out.destroy();
    if (status >= 400) await fs.rm(filePath, { force: true }).catch(() => {});
    json(res, status, body);
  };

  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > maxUploadBytes) {
      req.destroy(new Error("File is too large"));
      void finish(413, { error: "File is too large. Maximum size is 100 MB per file." });
      return;
    }
    out.write(chunk);
  });

  req.on("end", async () => {
    if (done) return;
    out.end(async () => {
      await mutateDb(async (db) => {
        db.uploads[storageId] = {
          id: storageId,
          fileName,
          fileType,
          size,
          storedAt: Date.now(),
        };
      });
      done = true;
      json(res, 200, {
        fileStorageId: storageId,
        fileName,
        fileType,
        size,
        fileDataUrl: `/api/files/${storageId}`,
      });
    });
  });

  req.on("error", async () => {
    await finish(500, { error: "Upload failed." });
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/uploads") {
    return handleUpload(req, res);
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/files/")) {
    const storageId = url.pathname.split("/").pop();
    const db = await readDb();
    const meta = db.uploads[storageId];
    if (!meta) return notFound(res);
    const filePath = path.join(filesDir, storageId);
    try {
      await fs.access(filePath);
    } catch {
      return notFound(res);
    }
    res.writeHead(200, {
      "Content-Type": meta.fileType || "application/octet-stream",
      "Content-Disposition": `${url.searchParams.get("download") === "1" ? "attachment" : "inline"}; filename="${encodeURIComponent(meta.fileName)}"`,
    });
    createReadStream(filePath).pipe(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/papers") {
    const db = await readDb();
    return json(res, 200, db.papers.map(enrichPaper));
  }

  if (req.method === "POST" && url.pathname === "/api/papers") {
    const body = await readBody(req);
    if (!body.title || !body.year || !body.level || !body.type) {
      return badRequest(res, "Missing required paper fields.");
    }
    const record = {
      id: uid(),
      title: String(body.title),
      year: String(body.year),
      level: String(body.level),
      type: body.type === "Past Paper" ? "Past Paper" : "Model Paper",
      fileName: String(body.fileName || "paper.pdf"),
      fileStorageId: body.fileStorageId ? String(body.fileStorageId) : undefined,
      uploadedAt: Date.now(),
    };
    await mutateDb(async (db) => {
      db.papers.unshift(record);
    });
    return json(res, 200, enrichPaper(record));
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/papers/")) {
    const id = url.pathname.split("/").pop();
    const body = await readBody(req);
    let updated;
    await mutateDb(async (db) => {
      const idx = db.papers.findIndex((p) => p.id === id);
      if (idx < 0) return;
      const current = db.papers[idx];
      const next = {
        ...current,
        ...body,
      };
      db.papers[idx] = next;
      updated = next;
      if (body.fileStorageId && body.fileStorageId !== current.fileStorageId) {
        await removeStoredFile(current.fileStorageId);
        if (current.fileStorageId) delete db.uploads[current.fileStorageId];
      }
    });
    if (!updated) return notFound(res);
    return json(res, 200, enrichPaper(updated));
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/papers/")) {
    const id = url.pathname.split("/").pop();
    let fileStorageId;
    const db = await readDb();
    const target = db.papers.find((p) => p.id === id);
    if (!target) return notFound(res);
    fileStorageId = target.fileStorageId;
    await mutateDb(async (draft) => {
      draft.papers = draft.papers.filter((p) => p.id !== id);
      if (fileStorageId) delete draft.uploads[fileStorageId];
    });
    await removeStoredFile(fileStorageId);
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/submissions") {
    const db = await readDb();
    return json(res, 200, db.submissions.map(enrichSubmission));
  }

  if (req.method === "POST" && url.pathname === "/api/submissions") {
    const body = await readBody(req);
    if (!body.studentName || !body.problemText) {
      return badRequest(res, "Missing required submission fields.");
    }
    const record = {
      id: uid(),
      studentName: String(body.studentName),
      studentEmail: String(body.studentEmail || ""),
      grade: String(body.grade || ""),
      problemText: String(body.problemText),
      fileName: body.fileName ? String(body.fileName) : undefined,
      fileStorageId: body.fileStorageId ? String(body.fileStorageId) : undefined,
      replyText: body.replyText ? String(body.replyText) : undefined,
      replyHistory: Array.isArray(body.replyHistory) ? cloneReplyHistory(body.replyHistory) : [],
      repliedAt: body.repliedAt ? Number(body.repliedAt) : undefined,
      submittedAt: Date.now(),
      status: "new",
    };
    await mutateDb(async (db) => {
      db.submissions.unshift(record);
    });
    return json(res, 200, enrichSubmission(record));
  }

  if (req.method === "PATCH" && url.pathname.startsWith("/api/submissions/")) {
    const id = url.pathname.split("/").pop();
    const body = await readBody(req);
    let updated;
    await mutateDb(async (db) => {
      const idx = db.submissions.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const current = db.submissions[idx];
      const next = {
        ...current,
        ...body,
        replyHistory: body.replyHistory
          ? cloneReplyHistory(body.replyHistory)
          : current.replyHistory || [],
      };
      db.submissions[idx] = next;
      updated = next;
    });
    if (!updated) return notFound(res);
    return json(res, 200, enrichSubmission(updated));
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/submissions/")) {
    const id = url.pathname.split("/").pop();
    const db = await readDb();
    const target = db.submissions.find((s) => s.id === id);
    if (!target) return notFound(res);
    await mutateDb(async (draft) => {
      draft.submissions = draft.submissions.filter((s) => s.id !== id);
      if (target.fileStorageId) delete draft.uploads[target.fileStorageId];
    });
    await removeStoredFile(target.fileStorageId);
    return json(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/submissions/") && url.pathname.endsWith("/toggle")) {
    const id = url.pathname.split("/")[3];
    let updated;
    await mutateDb(async (db) => {
      const idx = db.submissions.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const current = db.submissions[idx];
      const nextStatus = current.status === "new" ? "reviewed" : "new";
      const next = { ...current, status: nextStatus };
      db.submissions[idx] = next;
      updated = next;
    });
    if (!updated) return notFound(res);
    return json(res, 200, enrichSubmission(updated));
  }

  return notFound(res);
}

async function serveStatic(req, res, url) {
  const distDir = path.join(root, "dist");
  let filePath = path.join(distDir, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    filePath = path.join(distDir, "index.html");
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".js"
        ? "text/javascript; charset=utf-8"
        : ext === ".css"
        ? "text/css; charset=utf-8"
        : ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
        ? "image/png"
        : "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

await ensureStorage();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      console.error(error);
      json(res, 500, { error: "Server error" });
    }
    return;
  }
  await serveStatic(req, res, url);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Math Club backend running at http://127.0.0.1:${port}`);
});
