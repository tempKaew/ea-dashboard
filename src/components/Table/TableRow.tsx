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
  const baseClasses = hoverable
    ? "group transition-colors hover:bg-[rgba(255,229,180,0.25)]"
    : "";
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
