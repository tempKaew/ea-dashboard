import type { ReactNode } from "react";
import { IconName, icons } from "./icons";

type StatTone = "sky" | "mint" | "butter" | "rose" | "matcha";

interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  color?: "white" | "green" | "red" | "yellow";
  colorBorder?: "default" | "green" | "red";
  icon?: IconName;
  footer?: ReactNode;
  tone?: StatTone;
}

const toneStyles: Record<
  StatTone,
  {
    card: string;
    blob: string;
    label: string;
    dot: string;
    iconWrap: string;
    value: string;
    footerBorder: string;
  }
> = {
  sky: {
    card: "border-blue-200/80 bg-gradient-to-b from-[#F0F7FF] to-white",
    blob: "bg-blue-200/40",
    label: "text-blue-700",
    dot: "bg-blue-400",
    iconWrap: "border-blue-200 bg-blue-100/80 text-blue-600",
    value: "text-blue-900",
    footerBorder: "border-blue-100",
  },
  mint: {
    card: "border-emerald-200/80 bg-gradient-to-b from-[#F3FBF7] to-white",
    blob: "bg-emerald-200/40",
    label: "text-emerald-800",
    dot: "bg-emerald-400",
    iconWrap: "border-emerald-200 bg-emerald-100/80 text-emerald-600",
    value: "text-slate-800",
    footerBorder: "border-emerald-100",
  },
  butter: {
    card: "border-amber-200/90 bg-gradient-to-b from-[#FEFCE8] to-white",
    blob: "bg-amber-200/40",
    label: "text-amber-700",
    dot: "bg-amber-400",
    iconWrap: "border-amber-200 bg-amber-100/90 text-amber-600",
    value: "text-amber-700",
    footerBorder: "border-amber-100",
  },
  rose: {
    card: "border-pink-200 bg-gradient-to-b from-[#FFF1F2] to-white",
    blob: "bg-pink-200/50",
    label: "text-rose-700",
    dot: "bg-rose-500",
    iconWrap: "border-rose-200 bg-rose-100 text-rose-600",
    value: "text-rose-600",
    footerBorder: "border-rose-100",
  },
  matcha: {
    card: "border-emerald-200 bg-gradient-to-b from-[#ECFDF5] to-white",
    blob: "bg-emerald-200/50",
    label: "text-emerald-800",
    dot: "bg-emerald-500",
    iconWrap: "border-emerald-200 bg-emerald-100 text-emerald-700",
    value: "text-emerald-600",
    footerBorder: "border-emerald-100",
  },
};

function resolveTone(
  tone: StatTone | undefined,
  color: StatCardProps["color"],
): StatTone {
  if (tone) return tone;
  if (color === "green") return "matcha";
  if (color === "red") return "rose";
  if (color === "yellow") return "butter";
  return "sky";
}

export default function StatCard({
  title,
  value = "",
  previousValue,
  color = "white",
  icon,
  footer,
  tone,
}: StatCardProps) {
  const resolved = resolveTone(tone, color);
  const styles = toneStyles[resolved];
  const IconComponent = icon ? icons[icon] : null;

  return (
    <div
      className={`pastel-card relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-4.5 ${styles.card}`}
    >
      <div
        className={`pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full blur-lg ${styles.blob}`}
      />

      <div className="relative z-10 mb-2 flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider uppercase ${styles.label}`}
        >
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {title}
        </span>
        {IconComponent && (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-2xl border shadow-sm ${styles.iconWrap}`}
          >
            <IconComponent className="h-4 w-4" size={16} />
          </div>
        )}
      </div>

      <div className="relative z-10 my-1 flex flex-wrap items-baseline gap-2">
        <span
          className={`font-tabular font-mono text-2xl font-extrabold tracking-tight sm:text-3xl ${styles.value}`}
        >
          {value}
        </span>
        {previousValue !== undefined && previousValue !== "" && (
          <span
            className={`font-tabular rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
              resolved === "rose"
                ? "bg-rose-100 text-rose-600"
                : resolved === "matcha"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {previousValue}
          </span>
        )}
      </div>

      {footer && (
        <div
          className={`relative z-10 mt-2.5 border-t pt-2 font-mono text-[11px] text-slate-500 ${styles.footerBorder}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
