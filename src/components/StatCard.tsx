import { IconName, icons } from "./icons";

interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  color?: "white" | "green" | "red" | "yellow";
  colorBorder?: "default" | "green" | "red";
  icon?: IconName;
}

export default function StatCard({
  title,
  value,
  previousValue,
  color = "white",
  colorBorder = "default",
  icon,
}: StatCardProps) {
  const colorClasses = {
    white: "text-gray-400",
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  const colorBorders = {
    default: "border-stone-800",
    green: "border-green-900",
    red: "border-red-900",
  };

  const IconComponent = icon ? icons[icon] : null;

  return (
    <div
      className={`rounded-lg shadow px-4 py-2 border ${colorBorders[colorBorder]}`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs text-gray-400">{title}</h3>
        {IconComponent && <IconComponent className="w-6 h-6 text-gray-400" />}
      </div>
      <p className={`text-lg font-bold ${colorClasses[color]}`}>
        <span>{value}</span>
        {previousValue && (
          <span className="text-xs font-bold text-stone-500 pl-2">{value}</span>
        )}
      </p>
    </div>
  );
}
