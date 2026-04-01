import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#52729b]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d3557] md:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
