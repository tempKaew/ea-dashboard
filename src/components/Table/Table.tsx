import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full border-collapse text-left text-xs ${className}`}
      >
        {children}
      </table>
    </div>
  );
}
