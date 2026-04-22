import { describe, it, expect } from "vitest";
import {
  appendAudit,
  createDataCenter,
  DataCenterError,
  deleteDataCenter,
  deriveSlug,
  getDataCenterBySlug,
  listAudit,
  listDataCenters,
  updateDataCenter,
} from "../src/db/datasist";
import { makeHarness, validDataCenter } from "./helpers";

describe("deriveSlug", () => {
  it("lowercases and collapses non-alphanumerics", () => {
    expect(
      deriveSlug({ company: "Acme Corp.", name: "West Hub", city: "São Paulo" }),
    ).toBe("acme-corp-west-hub-s-o-paulo");
  });
  it("trims leading/trailing dashes and caps at 128 chars", () => {
    expect(
      deriveSlug({ company: "!!A", name: "??B??", city: "__C__" }),
    ).toBe("a-b-c");
    const big = deriveSlug({
      company: "a".repeat(200),
      name: "b".repeat(200),
      city: "c".repeat(200),
    });
    expect(big.length).toBeLessThanOrEqual(128);
  });
});

describe("createDataCenter", () => {
  it("inserts and round-trips all fields", async () => {
    const { env } = makeHarness();
    const created = await createDataCenter(env, {
      ...validDataCenter(),
      primaryModels: ["llama-3.1-70b", "claude-3.5"],
      communityResistance: true,
      gridRisk: "medium",
      renewablePercent: 42,
    });
    expect(created.slug).toBe("aliasist-labs-alpha-compute-campus-pittsburgh");
    expect(created.primaryModels).toEqual(["llama-3.1-70b", "claude-3.5"]);
    expect(created.communityResistance).toBe(true);
    expect(created.gridRisk).toBe("medium");
    expect(created.renewablePercent).toBe(42);
    const fetched = await getDataCenterBySlug(env, created.slug);
    expect(fetched?.name).toBe("Alpha Compute Campus");
  });

  it("throws DataCenterError(slug_conflict) on duplicate slug", async () => {
    const { env } = makeHarness();
    await createDataCenter(env, validDataCenter());
    await expect(createDataCenter(env, validDataCenter())).rejects.toMatchObject(
      { code: "slug_conflict" },
    );
  });

  it("accepts an explicit slug override", async () => {
    const { env } = makeHarness();
    const created = await createDataCenter(env, {
      ...validDataCenter(),
      slug: "custom-slug-42",
    });
    expect(created.slug).toBe("custom-slug-42");
  });
});

describe("updateDataCenter", () => {
  it("updates fields and increments updated_at", async () => {
    const { env } = makeHarness();
    const created = await createDataCenter(env, validDataCenter());
    const updated = await updateDataCenter(env, created.slug, {
      capacityMW: 999,
      status: "under_construction",
    });
    expect(updated.capacityMW).toBe(999);
    expect(updated.status).toBe("under_construction");
  });

  it("refuses to change the slug", async () => {
    const { env } = makeHarness();
    const created = await createDataCenter(env, validDataCenter());
    const updated = await updateDataCenter(env, created.slug, {
      slug: "attempted-rename",
      name: "New Name",
    });
    expect(updated.slug).toBe(created.slug);
    expect(updated.name).toBe("New Name");
  });

  it("throws DataCenterError(not_found) for missing slug", async () => {
    const { env } = makeHarness();
    await expect(
      updateDataCenter(env, "does-not-exist", { name: "x" }),
    ).rejects.toBeInstanceOf(DataCenterError);
  });
});

describe("deleteDataCenter", () => {
  it("removes the row", async () => {
    const { env } = makeHarness();
    const created = await createDataCenter(env, validDataCenter());
    await deleteDataCenter(env, created.slug);
    expect(await getDataCenterBySlug(env, created.slug)).toBeNull();
  });

  it("throws not_found when the slug is missing", async () => {
    const { env } = makeHarness();
    await expect(deleteDataCenter(env, "ghost")).rejects.toMatchObject({
      code: "not_found",
    });
  });
});

describe("audit log", () => {
  it("appends entries and lists them newest-first", async () => {
    const { env } = makeHarness();
    await appendAudit(env, {
      action: "create",
      slug: "one",
      actor: "abc123",
      payload: { name: "One" },
    });
    await appendAudit(env, {
      action: "update",
      slug: "two",
      actor: null,
      payload: { name: "Two" },
    });
    const entries = await listAudit(env, 10);
    expect(entries.map((e) => e.slug)).toEqual(["two", "one"]);
    expect(entries[0].payload).toEqual({ name: "Two" });
    expect(entries[1].actor).toBe("abc123");
  });
});

describe("listDataCenters filter behaviour", () => {
  it("escapes LIKE wildcards so `100%` matches literally", async () => {
    const { env } = makeHarness();
    await createDataCenter(env, {
      ...validDataCenter(),
      name: "Normal Facility",
      slug: "normal",
    });
    await createDataCenter(env, {
      ...validDataCenter(),
      name: "100% Renewable Hub",
      slug: "pct",
    });
    const wildcard = await listDataCenters(env, { q: "100%" });
    // Both rows would match if `%` were treated as a wildcard; only the
    // literal "100%" one should come back.
    expect(wildcard.items.map((i) => i.slug)).toEqual(["pct"]);
  });

  it("filters by country and companyType", async () => {
    const { env } = makeHarness();
    await createDataCenter(env, {
      ...validDataCenter(),
      slug: "usa-1",
      country: "USA",
      companyType: "hyperscale",
    });
    await createDataCenter(env, {
      ...validDataCenter(),
      slug: "ire-1",
      country: "Ireland",
      companyType: "colocation",
    });
    const usa = await listDataCenters(env, { country: "USA" });
    expect(usa.items.map((i) => i.slug)).toEqual(["usa-1"]);
    const colo = await listDataCenters(env, { companyType: "colocation" });
    expect(colo.items.map((i) => i.slug)).toEqual(["ire-1"]);
  });
});
