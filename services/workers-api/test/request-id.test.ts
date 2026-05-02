import { describe, expect, it } from "vitest";
import { makeHarness } from "./helpers";

describe("x-request-id middleware", () => {
  it("generates a UUID when header omitted", async () => {
    const { request } = makeHarness();
    const res = await request("/health");
    expect(res.status).toBe(200);
    const id = res.headers.get("x-request-id");
    expect(id).toBeTruthy();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("echoes a valid inbound x-request-id", async () => {
    const { request } = makeHarness();
    const res = await request("/health", {
      headers: { "x-request-id": "trace-from-upstream" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("trace-from-upstream");
  });
});
