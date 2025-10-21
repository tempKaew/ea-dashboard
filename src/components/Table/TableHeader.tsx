import React from "react";

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-stone-800 ${className}`}>
      <tr>{children}</tr>
    </thead>
  );
}
