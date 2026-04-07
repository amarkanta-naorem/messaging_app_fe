interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isCode?: boolean;
  badge?: boolean;
}

export default function DetailCard({ icon, label, value, isCode = false, badge = false }: DetailCardProps) {
  return (
    <div className="bg-(--bg-secondary) rounded-lg p-4 border border-(--border-primary)">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-(--text-muted) text-sm">{label}</span>
      </div>
      {isCode ? (
        <code className="text-xs bg-(--bg-tertiary) px-2 py-1 rounded text-(--text-secondary) font-mono">{value || "-"}</code>
      ) : badge ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{value || "-"}</span>
      ) : (
        <span className="text-(--text-primary) text-sm font-medium">{value || "-"}</span>
      )}
    </div>
  );
}