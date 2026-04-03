/**
 * Branch-related type definitions.
 * Matches API: /organisations/:organisationId/branches
 */

export type BranchStatus = "active" | "inactive" | "closed";

export interface ManagerDetails {
  name: string | null;
  phone: string;
  email: string | null;
  avatar: string | null;
}

export interface Branch {
  id: number;
  organisationId: number;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  latitude: string;
  longitude: string;
  isHeadquarters: boolean;
  status: BranchStatus;
  managerId: number | null;
  createdBy: number | null;
  createdAt: string;
  manager: {
    name: string | null;
    phone: string;
    email: string | null;
    avatar: string | null;
  } | null;
}

export interface BranchListItem {
  id: number;
  name: string;
  code: string | null;
  status: BranchStatus;
  isHeadquarters: boolean;
  createdAt: string;
  manager: {
    name: string | null;
    phone: string;
    email: string | null;
    avatar: string | null;
  } | null;
}

export interface BranchPagination {
  page: number;
  limit: number;
  total: number;
}

export interface BranchListResponse {
  branches: BranchListItem[];
  pagination: BranchPagination;
}

export interface BranchPayload {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  latitude: number;
  longitude: number;
  isHeadquarters?: boolean;
  status?: BranchStatus;
  managerId?: number;
}
