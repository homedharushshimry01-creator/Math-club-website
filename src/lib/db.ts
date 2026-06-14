// Cloud Database Layer
// Metadata is stored in localStorage and uploaded files are stored in IndexedDB.
// This avoids localStorage quota failures and supports much larger uploads.

export type Paper = {
  id: string;
  title: string;
  year: string;
  level: string;
  type: "Model Paper" | "Past Paper";
  fileName: string;
  fileDataUrl?: string;
  fileStorageId?: string;
  uploadedAt: number;
};

export type Submission = {
  id: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  problemText: string;
  fileName?: string;
  fileDataUrl?: string;
  fileStorageId?: string;
  replyText?: string;
  repliedAt?: number;
  replyHistory?: ReplyEntry[];
  submittedAt: number;
  status: "new" | "reviewed";
};

export type ReplyEntry = {
  id: string;
  text: string;
  createdAt: number;
};

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const API_BASE = "/__no_api__";

const PAPERS_KEY = "aans_math_papers_v1";
const SUBMISSIONS_KEY = "aans_math_submissions_v1";
const FILE_DB = "aans_math_files_v1";
const FILE_STORE = "files";

// ---------- Generic helpers ----------
const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

async function apiOk(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }
}

async function dataUrlToBlob(dataUrl: string) {
  return await (await fetch(dataUrl)).blob();
}

function sanitizePaper(paper: Paper): Paper {
  if (!paper.fileStorageId) return paper;
  const { fileDataUrl: _ignored, ...rest } = paper;
  return rest;
}

function sanitizeSubmission(sub: Submission): Submission {
  if (!sub.fileStorageId) return sub;
  const { fileDataUrl: _ignored, ...rest } = sub;
  return rest;
}

// ---------- IndexedDB helpers ----------
type StoredFile = {
  id: string;
  blob: Blob;
  fileName: string;
  fileType: string;
  size: number;
  savedAt: number;
};

type StoredFileInput = Omit<StoredFile, "id" | "savedAt">;

const fileUrlCache = new Map<string, string>();

function openFileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FILE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putStoredFile(id: string, input: StoredFileInput) {
  const cached = fileUrlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    fileUrlCache.delete(id);
  }
  const db = await openFileDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).put({
      id,
      ...input,
      savedAt: Date.now(),
    } satisfies StoredFile);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getStoredFile(id: string): Promise<StoredFile | undefined> {
  const db = await openFileDb();
  const record = await new Promise<StoredFile | undefined>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readonly");
    const req = tx.objectStore(FILE_STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredFile | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return record;
}

async function deleteStoredFile(id?: string) {
  if (!id) return;
  const cached = fileUrlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    fileUrlCache.delete(id);
  }
  const db = await openFileDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getStoredFileUrl(id?: string) {
  if (!id) return "";
  const cached = fileUrlCache.get(id);
  if (cached) return cached;
  const record = await getStoredFile(id);
  if (!record) return "";
  const url = URL.createObjectURL(record.blob);
  fileUrlCache.set(id, url);
  return url;
}

async function migrateLegacyFiles() {
  const legacyPapers = read<Paper[]>(PAPERS_KEY, []);
  const migratedPapers = await Promise.all(
    legacyPapers.map(async (paper) => {
      if (!paper.fileStorageId && paper.fileDataUrl?.startsWith("data:")) {
        const blob = await dataUrlToBlob(paper.fileDataUrl);
        await putStoredFile(paper.id, {
          blob,
          fileName: paper.fileName,
          fileType: blob.type || "application/octet-stream",
          size: blob.size,
        });
        const { fileDataUrl: _ignored, ...rest } = paper;
        return { ...rest, fileStorageId: paper.id };
      }
      return paper;
    })
  );
  if (migratedPapers.some((p, i) => p !== legacyPapers[i])) {
    write(PAPERS_KEY, migratedPapers);
  }

  const legacySubs = read<Submission[]>(SUBMISSIONS_KEY, []);
  const migratedSubs = await Promise.all(
    legacySubs.map(async (sub) => {
      if (!sub.fileStorageId && sub.fileDataUrl?.startsWith("data:")) {
        const blob = await dataUrlToBlob(sub.fileDataUrl);
        await putStoredFile(sub.id, {
          blob,
          fileName: sub.fileName || "attachment",
          fileType: blob.type || "application/octet-stream",
          size: blob.size,
        });
        const { fileDataUrl: _ignored, ...rest } = sub;
        return { ...rest, fileStorageId: sub.id };
      }
      return sub;
    })
  );
  if (migratedSubs.some((s, i) => s !== legacySubs[i])) {
    write(SUBMISSIONS_KEY, migratedSubs);
  }
}

const ready = (async () => {
  await migrateLegacyFiles();
  seed();
})();

export async function storeUpload(file: File, storageId = uid()) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large. Maximum size is 100 MB per file.");
  }
  try {
    const response = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-Storage-Id": storageId,
      },
      body: file,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || "Upload failed.");
    }
    const uploaded = (await response.json()) as {
      fileStorageId: string;
      fileDataUrl: string;
    };
    return uploaded;
  } catch {
  await putStoredFile(storageId, {
    blob: file,
    fileName: file.name,
    fileType: file.type,
    size: file.size,
  });
  return {
    fileStorageId: storageId,
    fileDataUrl: await getStoredFileUrl(storageId),
  };
  }
}

export async function removeUpload(storageId?: string) {
  await deleteStoredFile(storageId);
}

// Seed the database the first time the app is opened so the public Past
// Papers portal always has something to show in a demo.
function seed() {
  if (localStorage.getItem(PAPERS_KEY)) return;
  const seedPapers: Paper[] = [
    {
      id: uid(),
      title: "A/L Pure Mathematics — 2023 Model Paper",
      year: "2023",
      level: "A/L",
      type: "Model Paper",
      fileName: "AL-Pure-Math-2023-Model.pdf",
      fileDataUrl: "",
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
      id: uid(),
      title: "O/L Mathematics — 2022 Past Paper",
      year: "2022",
      level: "O/L",
      type: "Past Paper",
      fileName: "OL-Math-2022-Past.pdf",
      fileDataUrl: "",
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    },
    {
      id: uid(),
      title: "Grade 10 Mathematics — Term Test Model",
      year: "2024",
      level: "Grade 10",
      type: "Model Paper",
      fileName: "G10-Term-Model.pdf",
      fileDataUrl: "",
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    },
    {
      id: uid(),
      title: "Grade 11 Combined Mathematics — 2021 Past Paper",
      year: "2021",
      level: "Grade 11",
      type: "Past Paper",
      fileName: "G11-Combined-2021.pdf",
      fileDataUrl: "",
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 32,
    },
    {
      id: uid(),
      title: "A/L Applied Mathematics — 2020 Past Paper",
      year: "2020",
      level: "A/L",
      type: "Past Paper",
      fileName: "AL-Applied-2020.pdf",
      fileDataUrl: "",
      uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 50,
    },
  ];
  write(PAPERS_KEY, seedPapers);
}

// ---------- Papers API ----------
export const papersApi = {
  async list(): Promise<Paper[]> {
    try {
      await delay();
      return await apiJson<Paper[]>("/papers");
    } catch {
      await ready;
      await delay();
      const items = read<Paper[]>(PAPERS_KEY, []);
      const hydrated = await Promise.all(
        [...items]
          .sort((a, b) => b.uploadedAt - a.uploadedAt)
          .map(async (paper) => ({
            ...paper,
            fileDataUrl: paper.fileStorageId
              ? await getStoredFileUrl(paper.fileStorageId)
              : paper.fileDataUrl || "",
          }))
      );
      return hydrated;
    }
  },
  async create(p: Omit<Paper, "id" | "uploadedAt">): Promise<Paper> {
    try {
      await delay();
      return await apiJson<Paper>("/papers", {
        method: "POST",
        body: JSON.stringify(p),
      });
    } catch {
      await ready;
      await delay();
      const items = read<Paper[]>(PAPERS_KEY, []);
      const newPaper: Paper = sanitizePaper({
        ...p,
        id: uid(),
        uploadedAt: Date.now(),
      });
      items.push(newPaper);
      write(PAPERS_KEY, items);
      return {
        ...newPaper,
        fileDataUrl: newPaper.fileStorageId
          ? await getStoredFileUrl(newPaper.fileStorageId)
          : newPaper.fileDataUrl || "",
      };
    }
  },
  async update(id: string, patch: Partial<Paper>): Promise<void> {
    try {
      await delay();
      await apiOk(`/papers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      await ready;
      await delay();
      const items = read<Paper[]>(PAPERS_KEY, []);
      const idx = items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        const next = sanitizePaper({ ...items[idx], ...patch });
        items[idx] = next;
        write(PAPERS_KEY, items);
      }
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await delay();
      await apiOk(`/papers/${id}`, { method: "DELETE" });
    } catch {
      await ready;
      await delay();
      const items = read<Paper[]>(PAPERS_KEY, []);
      const target = items.find((i) => i.id === id);
      await deleteStoredFile(target?.fileStorageId);
      write(
        PAPERS_KEY,
        items.filter((i) => i.id !== id)
      );
    }
  },
};

// ---------- Submissions API ----------
export const submissionsApi = {
  async list(): Promise<Submission[]> {
    try {
      await delay();
      return await apiJson<Submission[]>("/submissions");
    } catch {
      await ready;
      await delay();
      const items = read<Submission[]>(SUBMISSIONS_KEY, []);
      const hydrated = await Promise.all(
        [...items]
          .sort((a, b) => b.submittedAt - a.submittedAt)
          .map(async (sub) => ({
            ...sub,
            fileDataUrl: sub.fileStorageId
              ? await getStoredFileUrl(sub.fileStorageId)
              : sub.fileDataUrl || "",
          }))
      );
      return hydrated;
    }
  },
  async create(
    s: Omit<Submission, "id" | "submittedAt" | "status">
  ): Promise<Submission> {
    try {
      await delay();
      return await apiJson<Submission>("/submissions", {
        method: "POST",
        body: JSON.stringify(s),
      });
    } catch {
      await ready;
      await delay();
      const items = read<Submission[]>(SUBMISSIONS_KEY, []);
      const newSub: Submission = sanitizeSubmission({
        ...s,
        id: uid(),
        submittedAt: Date.now(),
        status: "new",
      });
      items.push(newSub);
      write(SUBMISSIONS_KEY, items);
      return {
        ...newSub,
        fileDataUrl: newSub.fileStorageId
          ? await getStoredFileUrl(newSub.fileStorageId)
          : newSub.fileDataUrl || "",
      };
    }
  },
  async remove(id: string): Promise<void> {
    try {
      await delay();
      await apiOk(`/submissions/${id}`, { method: "DELETE" });
    } catch {
      await ready;
      await delay();
      const items = read<Submission[]>(SUBMISSIONS_KEY, []);
      const target = items.find((i) => i.id === id);
      await deleteStoredFile(target?.fileStorageId);
      write(
        SUBMISSIONS_KEY,
        items.filter((i) => i.id !== id)
      );
    }
  },
  async update(id: string, patch: Partial<Submission>): Promise<void> {
    try {
      await delay();
      await apiOk(`/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch {
      await ready;
      await delay();
      const items = read<Submission[]>(SUBMISSIONS_KEY, []);
      const idx = items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        const next = sanitizeSubmission({ ...items[idx], ...patch });
        items[idx] = next;
        write(SUBMISSIONS_KEY, items);
      }
    }
  },
  async toggleStatus(id: string): Promise<void> {
    try {
      await delay();
      await apiOk(`/submissions/${id}/toggle`, { method: "POST" });
    } catch {
      await ready;
      await delay();
      const items = read<Submission[]>(SUBMISSIONS_KEY, []);
      const idx = items.findIndex((i) => i.id === id);
      if (idx >= 0) {
        items[idx].status = items[idx].status === "new" ? "reviewed" : "new";
        write(SUBMISSIONS_KEY, items);
      }
    }
  },
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
