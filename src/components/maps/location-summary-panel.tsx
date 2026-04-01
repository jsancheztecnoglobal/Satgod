type LocationSummaryPanelProps = {
  title: string;
  address?: string;
  lat?: number;
  lng?: number;
  helper?: string;
};

function buildGoogleMapsUrl(address?: string, lat?: number, lng?: number) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return undefined;
}

export function LocationSummaryPanel({
  title,
  address,
  lat,
  lng,
  helper,
}: LocationSummaryPanelProps) {
  const externalUrl = buildGoogleMapsUrl(address, lat, lng);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <p className="font-semibold text-[#1d3557]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {address || "No hay direccion ni coordenadas disponibles."}
      </p>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}

      {lat != null && lng != null ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Coordenadas: {lat}, {lng}
        </div>
      ) : null}

      {externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
        >
          Abrir en Google Maps
        </a>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Sin ubicacion suficiente para abrir el mapa.
        </div>
      )}
    </div>
  );
}
