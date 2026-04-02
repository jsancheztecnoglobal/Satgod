"use client";

import { useEffect, useMemo, useRef } from "react";

type MarkerInput = {
  id: string;
  label: string;
  title?: string;
  lat: number;
  lng: number;
  color?: string;
};

type MapDefaultView = {
  lat: number;
  lng: number;
  zoom: number;
  description?: string;
};

type MapsLibrary = {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => { fitBounds: (bounds: LatLngBoundsLike, padding?: number) => void };
};

type MarkerLibrary = {
  AdvancedMarkerElement: new (options: Record<string, unknown>) => unknown;
  PinElement: new (options: Record<string, unknown>) => { element: HTMLElement };
};

type LatLngBoundsLike = {
  extend: (position: { lat: number; lng: number }) => void;
};

type DirectionsServiceLike = {
  route: (
    request: Record<string, unknown>,
    callback: (result: unknown, status: string) => void,
  ) => void;
};

type DirectionsRendererLike = {
  setDirections: (result: unknown) => void;
  setMap: (map: unknown) => void;
};

type MarkerLike = new (options: Record<string, unknown>) => unknown;

type GoogleMapsApi = {
  maps: {
    importLibrary: (name: "maps" | "marker") => Promise<MapsLibrary | MarkerLibrary>;
    LatLngBounds: new () => LatLngBoundsLike;
    DirectionsService: new () => DirectionsServiceLike;
    DirectionsRenderer: new (options: Record<string, unknown>) => DirectionsRendererLike;
    Marker: MarkerLike;
    TravelMode: {
      DRIVING: string;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __tecnoglobalGoogleMapsLoader?: Promise<GoogleMapsApi>;
  }
}

function loadGoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("Google Maps no configurado."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__tecnoglobalGoogleMapsLoader) {
    return window.__tecnoglobalGoogleMapsLoader;
  }

  window.__tecnoglobalGoogleMapsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`;
    script.async = true;
    script.onload = () => {
      if (window.google) resolve(window.google);
      else reject(new Error("Google Maps no disponible."));
    };
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.appendChild(script);
  });

  return window.__tecnoglobalGoogleMapsLoader;
}

export function GoogleMapLive({
  markers,
  routeMarkerIds,
  enableRoutes = true,
  title,
  height = 360,
  defaultView = {
    lat: 41.8205,
    lng: 1.86768,
    zoom: 8,
    description: "Sin ubicaciones activas. Mostrando la cobertura base en Catalunya.",
  },
}: {
  markers: MarkerInput[];
  routeMarkerIds?: string[];
  enableRoutes?: boolean;
  title?: string;
  height?: number;
  defaultView?: MapDefaultView;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const routeIds = useMemo(() => routeMarkerIds ?? markers.map((marker) => marker.id), [markers, routeMarkerIds]);
  const defaultLat = defaultView.lat;
  const defaultLng = defaultView.lng;
  const defaultZoom = defaultView.zoom;
  const defaultDescription = defaultView.description;

  useEffect(() => {
    let mounted = true;
    let directionsRenderer: DirectionsRendererLike | null = null;

    async function renderMap() {
      if (!mapRef.current) return;
      const googleInstance = await loadGoogleMapsScript();
      if (!mounted || !mapRef.current) return;

      const mapsLibrary = (await googleInstance.maps.importLibrary("maps")) as MapsLibrary;
      const { Map } = mapsLibrary;
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      const markerLibrary = mapId
        ? ((await googleInstance.maps.importLibrary("marker")) as MarkerLibrary)
        : null;
      const AdvancedMarkerElement = markerLibrary?.AdvancedMarkerElement;
      const PinElement = markerLibrary?.PinElement;

      const map = new Map(mapRef.current, {
        center: markers.length
          ? { lat: markers[0].lat, lng: markers[0].lng }
          : { lat: defaultLat, lng: defaultLng },
        zoom: markers.length ? (markers.length > 1 ? 6 : 15) : defaultZoom,
        ...(mapId ? { mapId } : {}),
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      const bounds = new googleInstance.maps.LatLngBounds();
      markers.forEach((marker, index) => {
        bounds.extend({ lat: marker.lat, lng: marker.lng });
        if (AdvancedMarkerElement && PinElement) {
          const pin = new PinElement({
            background: marker.color ?? "#1f4b7f",
            borderColor: "#ffffff",
            glyphColor: "#ffffff",
            glyph: String(index + 1),
          });

          new AdvancedMarkerElement({
            map,
            position: { lat: marker.lat, lng: marker.lng },
            title: marker.title ?? marker.label,
            content: pin.element,
          });
        } else {
          new googleInstance.maps.Marker({
            map,
            position: { lat: marker.lat, lng: marker.lng },
            title: marker.title ?? marker.label,
            label: String(index + 1),
          });
        }
      });

      if (markers.length > 1) {
        map.fitBounds(bounds, 60);
      }

      const routeMarkers = routeIds
        .map((routeId) => markers.find((marker) => marker.id === routeId))
        .filter((marker): marker is MarkerInput => Boolean(marker));

      if (enableRoutes && routeMarkers.length >= 2) {
        const directionsService = new googleInstance.maps.DirectionsService();
        directionsRenderer = new googleInstance.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#1f4b7f",
            strokeWeight: 5,
          },
        });

        directionsService.route(
          {
            origin: { lat: routeMarkers[0].lat, lng: routeMarkers[0].lng },
            destination: {
              lat: routeMarkers[routeMarkers.length - 1].lat,
              lng: routeMarkers[routeMarkers.length - 1].lng,
            },
            waypoints: routeMarkers.slice(1, -1).map((marker) => ({
              location: { lat: marker.lat, lng: marker.lng },
              stopover: true,
            })),
            optimizeWaypoints: false,
            travelMode: googleInstance.maps.TravelMode.DRIVING,
          },
          (result: unknown, status: string) => {
            if (status === "OK" && result) {
              directionsRenderer?.setDirections(result);
            }
          },
        );
      }
    }

    void renderMap();

    return () => {
      mounted = false;
      directionsRenderer?.setMap(null);
    };
  }, [defaultLat, defaultLng, defaultZoom, enableRoutes, markers, routeIds]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-semibold text-[#1d3557]">{title ?? "Google Maps"}</p>
        <p className="mt-2 text-sm text-slate-500">
          Falta configurar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para activar el mapa avanzado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      {title ? (
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="font-semibold text-[#1d3557]">{title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {markers.length
              ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
                ? "Marcadores avanzados y rutas calculadas con Google Maps JS."
                : "Mapa y marcadores basicos activos. Anade Map ID si quieres marcadores avanzados."
              : defaultDescription}
          </p>
        </div>
      ) : null}
      <div ref={mapRef} style={{ height }} className="w-full" />
    </div>
  );
}
