import { cn } from "@/lib/cn";

export function Panel({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
