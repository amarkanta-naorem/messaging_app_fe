/**
 * Employee and contact-related type definitions.
 */

export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  joinedAt: string | Date;
}

export interface Group {
  id: string | number;
  name: string;
  avatar: string | null;
}

export interface ContactDetails extends Employee {
  groups?: Group[];
}

export interface OrgGroup {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  isAnnouncementOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  avatar: string | null;
  bio?: string | null;
  isJoined?: boolean;
}

export interface GroupMember {
  id: number;
  name: string;
  phone: string;
  role: "admin" | "member";
}

export interface GroupDetails {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  group_members: GroupMember[];
  createdAt: string;
}
