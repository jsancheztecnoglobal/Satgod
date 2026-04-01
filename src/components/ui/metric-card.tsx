import type { DashboardMetric } from "@/lib/data/contracts";
import { cn } from "@/lib/cn";

const tones: Record<DashboardMetric["tone"], string> = {
  navy: "bg-[#1f4b7f]",
  blue: "bg-[#2f7ed8]",
  green: "bg-[#2aa36b]",
  orange: "bg-[#f28b39]",
  red: "bg-[#ef5b6c]",
};

export function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article
      className={cn(
        "rounded-xl px-5 py-4 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]",
        tones[metric.tone],
      )}
    >
      <p className="text-sm font-medium text-white/85">{metric.label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-4xl font-semibold leading-none">{metric.value}</p>
        <div className="h-px flex-1 bg-white/35" />
      </div>
      <p className="mt-3 text-sm text-white/80">{metric.helper}</p>
    </article>
  );
}
