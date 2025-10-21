import React from "react";

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody className={`bg-stone-900 divide-y divide-stone-800 ${className}`}>
      {children}
    </tbody>
  );
}
