import { describe, expect, it } from "vitest";
import {
  normalizeEonetEvent,
  normalizeNwsAlert,
  normalizeUsgsQuake,
} from "../src/routes/eco";

describe("normalizeNwsAlert", () => {
  it("extracts fields, clamps string length, and preserves geometry", () => {
    const out = normalizeNwsAlert({
      id: "urn:oid:abc",
      geometry: { type: "Point", coordinates: [-99.5, 35.5] },
      properties: {
        event: "Severe Thunderstorm Warning",
        severity: "Severe",
        urgency: "Immediate",
        certainty: "Observed",
        headline: "ST WARN",
        areaDesc: "X County",
        sent: "2025-04-01T00:00:00Z",
        effective: "2025-04-01T00:00:00Z",
        expires: "2025-04-01T01:00:00Z",
        description: "Big storm",
        instruction: "Take shelter",
        senderName: "NWS Norman",
      },
    });
    expect(out).not.toBeNull();
    expect(out!.id).toBe("urn:oid:abc");
    expect(out!.event).toBe("Severe Thunderstorm Warning");
    expect(out!.severity).toBe("Severe");
    expect(out!.geometry).toEqual({ type: "Point", coordinates: [-99.5, 35.5] });
  });

  it("returns null without an event or id", () => {
    expect(normalizeNwsAlert({ id: "x", properties: {} })).toBeNull();
    expect(
      normalizeNwsAlert({ properties: { event: "Flood Warning" } }),
    ).toBeNull();
  });

  it("coerces non-string fields to null instead of throwing", () => {
    const out = normalizeNwsAlert({
      id: "urn:oid:num",
      properties: {
        event: "Flood",
        severity: 42 as unknown as string,
      },
    });
    expect(out!.severity).toBeNull();
  });
});

describe("normalizeUsgsQuake", () => {
  it("pulls magnitude + lat/lng/depth out of geometry", () => {
    const out = normalizeUsgsQuake({
      id: "q1",
      geometry: { coordinates: [-118.2, 34.05, 7.5] },
      properties: {
        mag: 4.9,
        place: "10km N of Somewhere",
        time: 1712000000000,
        url: "https://earthquake.usgs.gov/events/q1",
        tsunami: 0,
        status: "reviewed",
        alert: "yellow",
      },
    });
    expect(out).not.toBeNull();
    expect(out!.magnitude).toBe(4.9);
    expect(out!.lat).toBe(34.05);
    expect(out!.lng).toBe(-118.2);
    expect(out!.depth).toBe(7.5);
    expect(out!.tsunami).toBe(false);
  });

  it("sets tsunami=true when the upstream flag is truthy", () => {
    const out = normalizeUsgsQuake({
      id: "q2",
      geometry: { coordinates: [0, 0, 0] },
      properties: { mag: 6.3, tsunami: 1 },
    });
    expect(out!.tsunami).toBe(true);
  });

  it("returns null when magnitude or coordinates are missing", () => {
    expect(
      normalizeUsgsQuake({ id: "x", geometry: { coordinates: [0, 0] }, properties: {} }),
    ).toBeNull();
    expect(
      normalizeUsgsQuake({ id: "x", properties: { mag: 5 } }),
    ).toBeNull();
  });
});

describe("normalizeEonetEvent", () => {
  it("uses the latest geometry entry for coords + date", () => {
    const out = normalizeEonetEvent({
      id: "e1",
      title: "Kilauea",
      categories: [{ title: "Volcanoes" }],
      geometry: [
        { date: "2025-01-01", coordinates: [-155, 19] },
        { date: "2025-04-01", coordinates: [-155.25, 19.4] },
      ],
    });
    expect(out!.category).toBe("Volcanoes");
    expect(out!.lat).toBeCloseTo(19.4, 2);
    expect(out!.lng).toBeCloseTo(-155.25, 2);
    expect(out!.date).toBe("2025-04-01");
  });

  it("returns null without id or title", () => {
    expect(normalizeEonetEvent({ id: "x" })).toBeNull();
    expect(normalizeEonetEvent({ title: "x" })).toBeNull();
  });

  it("handles events without geometry", () => {
    const out = normalizeEonetEvent({ id: "e", title: "Dust storm" });
    expect(out!.lat).toBeNull();
    expect(out!.lng).toBeNull();
  });
});
