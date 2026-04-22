import { useState } from "react";
import type {
  DataCenter,
  DataCenterInput,
  DC_COMPANY_TYPES,
  DC_GRID_RISKS,
  DC_STATUSES,
} from "@aliasist/api-client";

type CompanyType = (typeof DC_COMPANY_TYPES)[number];
type Status = (typeof DC_STATUSES)[number];
type GridRisk = (typeof DC_GRID_RISKS)[number];

interface EntryFormProps {
  initial?: DataCenter;
  onSubmit: (input: DataCenterInput) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

/**
 * Minimal controlled form for data-center admin CRUD. Only required fields
 * are enforced; optional numeric fields render blank and serialize to null.
 */
export const EntryForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: EntryFormProps) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [companyType, setCompanyType] = useState<CompanyType>(
    initial?.companyType ?? "hyperscale",
  );
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [country, setCountry] = useState(initial?.country ?? "USA");
  const [lat, setLat] = useState(initial?.lat?.toString() ?? "");
  const [lng, setLng] = useState(initial?.lng?.toString() ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "operational");
  const [capacityMW, setCapacityMW] = useState(
    initial?.capacityMW?.toString() ?? "",
  );
  const [estGWh, setEstGWh] = useState(
    initial?.estimatedAnnualGWh?.toString() ?? "",
  );
  const [water, setWater] = useState(
    initial?.waterUsageMillionGallons?.toString() ?? "",
  );
  const [investment, setInvestment] = useState(
    initial?.investmentBillions?.toString() ?? "",
  );
  const [acreage, setAcreage] = useState(initial?.acreage?.toString() ?? "");
  const [yearOpened, setYearOpened] = useState(
    initial?.yearOpened?.toString() ?? "",
  );
  const [yearPlanned, setYearPlanned] = useState(
    initial?.yearPlanned?.toString() ?? "",
  );
  const [gridRisk, setGridRisk] = useState<GridRisk | "">(
    initial?.gridRisk ?? "",
  );
  const [renewablePercent, setRenewablePercent] = useState(
    initial?.renewablePercent?.toString() ?? "",
  );
  const [communityResistance, setCommunityResistance] = useState(
    initial?.communityResistance ?? false,
  );
  const [primaryModels, setPrimaryModels] = useState(
    (initial?.primaryModels ?? []).join(", "),
  );
  const [communityImpact, setCommunityImpact] = useState(
    initial?.communityImpact ?? "",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseNum = (s: string): number | null => {
    if (!s.trim()) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latN = Number(lat);
    const lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
      setError("Latitude and longitude must be numeric.");
      return;
    }
    const models = primaryModels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const input: DataCenterInput = {
      name: name.trim(),
      company: company.trim(),
      companyType,
      city: city.trim(),
      state: state.trim(),
      country: country.trim() || "USA",
      lat: latN,
      lng: lngN,
      status,
      capacityMW: parseNum(capacityMW),
      estimatedAnnualGWh: parseNum(estGWh),
      waterUsageMillionGallons: parseNum(water),
      investmentBillions: parseNum(investment),
      acreage: parseNum(acreage),
      yearOpened: parseNum(yearOpened),
      yearPlanned: parseNum(yearPlanned),
      gridRisk: gridRisk || null,
      renewablePercent: parseNum(renewablePercent),
      communityResistance,
      primaryModels: models,
      communityImpact: communityImpact.trim() || null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-ink-700 bg-ink-900/60 p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase tracking-[0.2em] text-ink-200">
          {initial ? `Edit · ${initial.slug}` : "New data center"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] uppercase tracking-[0.14em] text-ink-400 transition hover:text-ink-200"
        >
          Cancel ✕
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Company" required>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Company type" required>
          <select
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value as CompanyType)}
            className={inputClass}
          >
            <option value="hyperscale">Hyperscale</option>
            <option value="colocation">Colocation</option>
            <option value="neocloud">Neocloud</option>
          </select>
        </Field>
        <Field label="Status" required>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={inputClass}
          >
            <option value="operational">Operational</option>
            <option value="under_construction">Under construction</option>
            <option value="planned">Planned</option>
            <option value="canceled">Canceled</option>
          </select>
        </Field>
        <Field label="City" required>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="State / region" required>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Grid risk">
          <select
            value={gridRisk}
            onChange={(e) => setGridRisk(e.target.value as GridRisk | "")}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Latitude" required>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Longitude" required>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Capacity (MW)">
          <input
            type="number"
            step="any"
            value={capacityMW}
            onChange={(e) => setCapacityMW(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Annual electricity (GWh)">
          <input
            type="number"
            step="any"
            value={estGWh}
            onChange={(e) => setEstGWh(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Water (M gal/yr)">
          <input
            type="number"
            step="any"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Investment ($B)">
          <input
            type="number"
            step="any"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Acreage">
          <input
            type="number"
            step="any"
            value={acreage}
            onChange={(e) => setAcreage(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Renewable %">
          <input
            type="number"
            step="any"
            min={0}
            max={100}
            value={renewablePercent}
            onChange={(e) => setRenewablePercent(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Year opened">
          <input
            type="number"
            step="1"
            value={yearOpened}
            onChange={(e) => setYearOpened(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Year planned">
          <input
            type="number"
            step="1"
            value={yearPlanned}
            onChange={(e) => setYearPlanned(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Primary AI models (comma separated)">
        <input
          value={primaryModels}
          onChange={(e) => setPrimaryModels(e.target.value)}
          placeholder="llama-3.1-70b, claude-3.5-sonnet"
          className={inputClass}
        />
      </Field>

      <Field label="Community impact notes">
        <textarea
          rows={3}
          value={communityImpact}
          onChange={(e) => setCommunityImpact(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Curator notes">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2 text-xs text-ink-300">
        <input
          type="checkbox"
          checked={communityResistance}
          onChange={(e) => setCommunityResistance(e.target.checked)}
          className="h-4 w-4 rounded border-ink-700 bg-ink-950 text-ufo-500 focus:ring-ufo-500/40"
        />
        Community resistance reported
      </label>

      {error ? (
        <div className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ufo-500 px-3 py-1.5 text-xs font-medium text-ink-950 transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

const inputClass =
  "mt-1 w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-500 focus:outline-none focus:ring-1 focus:ring-ufo-500/40";

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
      {label}
      {required ? <span className="ml-1 text-ufo-400">*</span> : null}
    </span>
    {children}
  </label>
);
