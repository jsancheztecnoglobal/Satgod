import { GoogleMapLive } from "@/components/maps/google-maps-live";

export function GoogleMapEmbed({
  address,
  lat,
  lng,
  title,
  compact = false,
}: {
  address?: string;
  lat?: number;
  lng?: number;
  title?: string;
  compact?: boolean;
}) {
  const markers =
    lat != null && lng != null
      ? [
          {
            id: "location",
            label: title ?? address ?? "Ubicacion",
            title: address ?? title ?? "Ubicacion",
            lat,
            lng,
            color: "#1f4b7f",
          },
        ]
      : [];

  return <GoogleMapLive markers={markers} title={title} height={compact ? 260 : 360} />;
}
