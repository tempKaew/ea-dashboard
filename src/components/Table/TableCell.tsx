import React from "react";

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "danger" | "warning";
  align?: "left" | "right" | "center";
}

export function TableCell({
  children,
  className = "",
  variant = "default",
  align = "left",
}: TableCellProps) {
  const baseClasses = "px-4 py-4 whitespace-nowrap";

  const alignClasses = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  const variantClasses = {
    default: "text-slate-600",
    primary: "font-bold text-indigo-600 group-hover:text-indigo-700",
    success: "font-tabular font-bold text-emerald-600",
    danger: "font-tabular font-bold text-rose-600",
    warning: "font-tabular font-bold text-amber-700",
  };

  return (
    <td
      className={`${baseClasses} ${alignClasses[align]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </td>
  );
}
