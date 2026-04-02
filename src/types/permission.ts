/**
 * Permission-related type definitions.
 * Matches API: /permissions
 */

export interface Permission {
  id: number;
  name: string;
  slug: string;
  module: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PermissionPagination {
  page: number;
  limit: number;
  total: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  pagination: PermissionPagination;
}

export interface PermissionPayload {
  name: string;
  slug: string;
  module: string;
  description?: string;
}
