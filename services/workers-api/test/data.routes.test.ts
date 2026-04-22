import { describe, it, expect } from "vitest";
import {
  authHeader,
  jsonBody,
  makeHarness,
  TEST_TOKEN,
  validDataCenter,
} from "./helpers";

describe("POST /data/data-centers — auth gate", () => {
  it("returns 401 without a bearer token", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers", jsonBody(validDataCenter()));
    expect(res.status).toBe(401);
  });

  it("returns 401 with the wrong bearer token", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers", {
      ...jsonBody(validDataCenter()),
      headers: {
        "Content-Type": "application/json",
        ...authHeader("definitely-wrong"),
      },
    });
    expect(res.status).toBe(401);
  });

  it("returns 503 when ADMIN_TOKEN is not configured", async () => {
    const { request } = makeHarness({ ADMIN_TOKEN: undefined });
    const res = await request("/data/data-centers", {
      ...jsonBody(validDataCenter()),
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    expect(res.status).toBe(503);
  });
});

describe("POST /data/data-centers — happy path", () => {
  it("creates a row, returns 201, and writes an audit entry", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers", {
      ...jsonBody(validDataCenter()),
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { slug: string; name: string };
    expect(body.slug).toBe("aliasist-labs-alpha-compute-campus-pittsburgh");

    const auditRes = await request("/data/audit", { headers: authHeader() });
    expect(auditRes.status).toBe(200);
    const audit = (await auditRes.json()) as {
      items: { action: string; slug: string; actor: string | null }[];
    };
    expect(audit.items).toHaveLength(1);
    expect(audit.items[0].action).toBe("create");
    expect(audit.items[0].slug).toBe(body.slug);
    // Actor is a short SHA-256 fingerprint, never the raw token.
    expect(audit.items[0].actor).not.toBe(TEST_TOKEN);
    expect(audit.items[0].actor).toMatch(/^[0-9a-f]{12}$/);
  });

  it("rejects invalid payloads with 400 and zod issues", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers", {
      ...jsonBody({ name: "", lat: 999 }),
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; issues?: unknown[] };
    expect(body.error).toBe("invalid_body");
    expect(Array.isArray(body.issues)).toBe(true);
  });

  it("returns 400 invalid_slug when the derived slug would be empty", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers", {
      ...jsonBody(validDataCenter({ company: "公", name: "数", city: "北" })),
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("invalid_slug");
  });

  it("returns 409 on slug conflict", async () => {
    const { request } = makeHarness();
    const body = validDataCenter();
    const headers = { "Content-Type": "application/json", ...authHeader() };
    const first = await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    expect(first.status).toBe(201);
    const second = await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    expect(second.status).toBe(409);
  });
});

describe("PUT /data/data-centers/:slug", () => {
  it("updates an existing entry and logs the change", async () => {
    const { request } = makeHarness();
    const headers = { "Content-Type": "application/json", ...authHeader() };
    const created = await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(validDataCenter()),
    });
    const { slug } = (await created.json()) as { slug: string };
    const updated = await request(`/data/data-centers/${slug}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ capacityMW: 777 }),
    });
    expect(updated.status).toBe(200);
    const body = (await updated.json()) as { capacityMW: number };
    expect(body.capacityMW).toBe(777);

    const auditRes = await request("/data/audit", { headers: authHeader() });
    const audit = (await auditRes.json()) as {
      items: { action: string; slug: string }[];
    };
    const actions = audit.items.map((a) => a.action);
    expect(actions).toContain("update");
  });

  it("returns 404 for a missing slug", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers/ghost-slug", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name: "x" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects malformed slugs with 400", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers/NOT VALID!", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ name: "x" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /data/data-centers/:slug", () => {
  it("deletes an entry and writes a delete audit row", async () => {
    const { request } = makeHarness();
    const headers = { "Content-Type": "application/json", ...authHeader() };
    const created = await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(validDataCenter()),
    });
    const { slug } = (await created.json()) as { slug: string };

    const del = await request(`/data/data-centers/${slug}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    expect(del.status).toBe(200);

    const fetched = await request(`/data/data-centers/${slug}`);
    expect(fetched.status).toBe(404);

    const auditRes = await request("/data/audit", { headers: authHeader() });
    const audit = (await auditRes.json()) as {
      items: { action: string }[];
    };
    expect(audit.items.map((a) => a.action)).toContain("delete");
  });

  it("returns 404 for a missing slug", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers/ghost", {
      method: "DELETE",
      headers: authHeader(),
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /data/data-centers — public + LIKE-escape regression", () => {
  it("is not gated by auth", async () => {
    const { request } = makeHarness();
    const res = await request("/data/data-centers");
    expect(res.status).toBe(200);
  });

  it("escapes LIKE wildcards in q (regression)", async () => {
    const { request } = makeHarness();
    const headers = { "Content-Type": "application/json", ...authHeader() };
    await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(validDataCenter({ name: "Normal Site", slug: "normal" })),
    });
    await request("/data/data-centers", {
      method: "POST",
      headers,
      body: JSON.stringify(
        validDataCenter({ name: "100% Green", slug: "green" }),
      ),
    });

    const res = await request("/data/data-centers?q=100%25");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { slug: string }[] };
    expect(body.items.map((i) => i.slug)).toEqual(["green"]);
  });

  it("falls back to 200 + note when DATA_DB is unbound", async () => {
    const { request } = makeHarness({ DATA_DB: undefined });
    const res = await request("/data/data-centers");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: unknown[]; note?: string };
    expect(body.items).toEqual([]);
    expect(typeof body.note).toBe("string");
  });
});
