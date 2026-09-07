import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:opacity-50",
        variant === "primary" &&
          "bg-[#082664] text-white shadow-lg shadow-blue-950/20 hover:bg-[#0c43a8] focus:ring-blue-200",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-200",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",
        className
      )}
      {...props}
    />
  );
}
