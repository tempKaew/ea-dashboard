import React from "react";

interface TableHeaderCellProps {
  children: React.ReactNode;
  sortable?: boolean;
  active?: boolean;
  direction?: "asc" | "desc";
  onClick?: () => void;
  className?: string;
}

export function TableHeaderCell({
  children,
  sortable = false,
  active = false,
  direction = "asc",
  onClick,
  className = "",
}: TableHeaderCellProps) {
  const baseClasses =
    "px-2 sm:px-4 py-2 text-left text-[10px] font-bold text-gray-300 uppercase";
  const sortableClasses = sortable ? "cursor-pointer hover:bg-stone-700" : "";

  return (
    <th
      className={`${baseClasses} ${sortableClasses} ${className}`}
      onClick={sortable ? onClick : undefined}
    >
      {sortable ? (
        <div className="flex items-center gap-1">
          {children}
          {active && (
            <span className="text-blue-400">
              {direction === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ) : (
        children
      )}
    </th>
  );
}
