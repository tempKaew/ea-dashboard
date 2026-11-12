import React from "react";

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead
      className={`border-b border-slate-200/80 bg-slate-50/80 font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase select-none ${className}`}
    >
      <tr>{children}</tr>
    </thead>
  );
}
