/**
 * Role-related type definitions.
 * Matches API: /organisations/:organisationId/roles
 */

export type RoleScope = "global" | "branch" | "department" | "custom";

export interface RolePermission {
  id: number;
  name: string;
  slug: string;
  module: string;
}

export interface Role {
  id: number;
  organisationId: number;
  name: string;
  slug: string;
  description: string | null;
  scope: RoleScope;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  permissions?: RolePermission[];
}

export interface RoleListItem {
  id: number;
  name: string;
  slug: string;
  scope: RoleScope;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
}

export interface RolePagination {
  page: number;
  limit: number;
  total: number;
}

export interface RoleListResponse {
  roles: RoleListItem[];
  pagination: RolePagination;
}

export interface RolePayload {
  name: string;
  slug: string;
  description?: string;
  scope?: RoleScope;
  isActive?: boolean;
}
