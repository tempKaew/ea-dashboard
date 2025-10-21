import React from "react";

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export function TableRow({
  children,
  onClick,
  className = "",
  hoverable = true,
}: TableRowProps) {
  const baseClasses = hoverable ? "hover:bg-stone-800 transition-colors" : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <tr
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
