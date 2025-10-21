import React from "react";

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "danger" | "warning";
}

export function TableCell({
  children,
  className = "",
  variant = "default",
}: TableCellProps) {
  const baseClasses = "px-6 py-1.5 whitespace-nowrap text-sm";

  const variantClasses = {
    default: "text-gray-300",
    primary: "font-medium text-white",
    success: "font-semibold text-green-400",
    danger: "font-semibold text-red-400",
    warning: "font-semibold text-yellow-400",
  };

  return (
    <td className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </td>
  );
}
