import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { TextChunk } from "../ingest.js";
import { RAG_INDEX_VERSION, type RagIndex, type RagIndexEntry } from "../rag-index.js";

const isNumberArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((x) => typeof x === "number" && Number.isFinite(x));

const isTextChunk = (v: unknown): v is TextChunk => {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    typeof o.source === "string" &&
    typeof o.index === "number"
  );
};

const assertRagIndex = (data: unknown): RagIndex => {
  if (!data || typeof data !== "object") {
    throw new Error("loadRagIndex: file is not a JSON object.");
  }
  const o = data as Record<string, unknown>;
  if (o.version !== RAG_INDEX_VERSION) {
    throw new Error(`loadRagIndex: unsupported version (expected ${RAG_INDEX_VERSION}).`);
  }
  if (typeof o.embedModel !== "string" || o.embedModel.length === 0) {
    throw new Error("loadRagIndex: missing or invalid embedModel.");
  }
  if (typeof o.builtAt !== "string") {
    throw new Error("loadRagIndex: missing builtAt.");
  }
  if (!Array.isArray(o.entries)) {
    throw new Error("loadRagIndex: entries must be an array.");
  }
  const entries: RagIndexEntry[] = [];
  for (const e of o.entries) {
    if (!e || typeof e !== "object") {
      throw new Error("loadRagIndex: invalid entry.");
    }
    const row = e as Record<string, unknown>;
    if (!isTextChunk(row.chunk)) {
      throw new Error("loadRagIndex: entry chunk invalid.");
    }
    if (!isNumberArray(row.embedding) || row.embedding.length === 0) {
      throw new Error("loadRagIndex: entry embedding must be a non-empty number array.");
    }
    entries.push({ chunk: row.chunk, embedding: row.embedding });
  }
  return {
    version: RAG_INDEX_VERSION,
    embedModel: o.embedModel,
    builtAt: o.builtAt,
    entries,
  };
};

export const saveRagIndex = async (filePath: string, index: RagIndex): Promise<void> => {
  await mkdir(dirname(filePath), { recursive: true });
  const body = `${JSON.stringify(index, null, 2)}\n`;
  await writeFile(filePath, body, "utf8");
};

export const loadRagIndex = async (filePath: string): Promise<RagIndex> => {
  const raw = await readFile(filePath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("loadRagIndex: file is not valid JSON.");
  }
  return assertRagIndex(parsed);
};
