import { Hono } from "hono";
import type { Env } from "../env";

export const eco = new Hono<{ Bindings: Env }>();

/**
 * Weather hub — thin proxy to Open-Meteo for the scaffold.
 * Expand to NWS alerts, SPC, USGS, NASA EONET in Phase 3.
 */
eco.get("/weather", async (c) => {
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");
  if (!lat || !lon) return c.json({ error: "lat_lon_required" }, 400);

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url, { cf: { cacheTtl: 60 } });
  if (!res.ok) return c.json({ error: "upstream_error" }, 502);
  const data = (await res.json()) as Record<string, unknown>;
  return c.json({ source: "open-meteo", data });
});
