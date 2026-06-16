import { LucideIcon } from "lucide-react";

interface SidebarIconProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

const SidebarIcon = ({ icon: Icon, label, active, expanded, onClick }: SidebarIconProps) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex items-center gap-3 rounded-xl transition-all ${
      expanded ? "w-full px-3 py-2.5" : "w-11 h-11 justify-center"
    } ${
      active
        ? "bg-red-100 text-red-500 shadow-sm"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {expanded && (
      <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-red-500" : "text-foreground"}`}>
        {label}
      </span>
    )}
  </button>
);

export default SidebarIcon;
