/**
 * Avatar component for displaying user/group avatars.
 * Supports fallback to initials when no image is provided.
 */

import Image from "next/image";

export interface AvatarProps {
  /** Image source URL */
  src?: string | null;
  /** Display name for generating initials fallback */
  name?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a status indicator */
  showStatus?: boolean;
  /** Status color (for online indicator) */
  statusColor?: "online" | "offline" | "away";
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

const statusSizeClasses = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-4 h-4 border-2",
};

export function Avatar({
  src,
  name = "",
  size = "md",
  className = "",
  showStatus = false,
  statusColor = "online",
}: AvatarProps) {
  const initials = name.charAt(0).toUpperCase();
  
  const statusColors = {
    online: "bg-[var(--status-online)]",
    offline: "bg-[var(--status-offline)]",
    away: "bg-[var(--color-warning)]",
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex items-center justify-center`}>
        {src ? (
          <Image src={src} alt={name || "Avatar"} fill className="object-cover" />
        ) : (
          <span className="text-[var(--text-inverse)] font-semibold">{initials}</span>
        )}
      </div>
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${statusColors[statusColor]} border-[var(--bg-card)] rounded-full`}/>
      )}
    </div>
  );
}

export default Avatar;
