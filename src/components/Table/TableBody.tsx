import React from "react";

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-slate-100 font-mono text-slate-600 ${className}`}
    >
      {children}
    </tbody>
  );
}
