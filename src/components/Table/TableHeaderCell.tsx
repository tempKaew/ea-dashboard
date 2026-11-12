import React from "react";

interface TableHeaderCellProps {
  children: React.ReactNode;
  sortable?: boolean;
  active?: boolean;
  direction?: "asc" | "desc";
  onClick?: () => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export function TableHeaderCell({
  children,
  sortable = false,
  active = false,
  direction = "asc",
  onClick,
  className = "",
  align = "left",
}: TableHeaderCellProps) {
  const alignClasses = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  return (
    <th
      className={`px-4 py-3.5 ${alignClasses[align]} ${sortable ? "cursor-pointer" : ""} ${className}`}
      onClick={sortable ? onClick : undefined}
      scope="col"
    >
      {sortable ? (
        <div
          className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""} ${active ? "text-slate-700" : ""}`}
        >
          <span>{children}</span>
          {active && (
            <svg
              className="h-3 w-3 text-teal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d={direction === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          )}
        </div>
      ) : (
        children
      )}
    </th>
  );
}
