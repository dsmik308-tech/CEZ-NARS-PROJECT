import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "blue",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "gold" | "red" | "slate" | "green";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        tone === "blue" && "bg-blue-50 text-[#0c43a8]",
        tone === "gold" && "bg-amber-50 text-amber-700",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "slate" && "bg-slate-100 text-slate-600",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        className
      )}
      {...props}
    />
  );
}
