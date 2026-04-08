export interface SettingSubItem {
  slug: string;
  label: string;
  href: string;
}

export const settingsManifest: SettingSubItem[] = [
  { slug: "organisation", label: "Organisation", href: "/system/setting/organisation" },
  { slug: "branches", label: "Branches", href: "/system/setting/branches" },
  { slug: "department", label: "Department", href: "/system/setting/department" },
  { slug: "roles", label: "Roles", href: "/system/setting/roles" },
  { slug: "permissions", label: "Permissions", href: "/system/setting/permissions" },
];

export function slugToLabel(slug: string): string {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
