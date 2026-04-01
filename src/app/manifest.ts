import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tecnoglobal FSM",
    short_name: "Tecnoglobal",
    description: "FSM / SAT / GMAO para servicios técnicos industriales.",
    start_url: "/login",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: "es-ES",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
