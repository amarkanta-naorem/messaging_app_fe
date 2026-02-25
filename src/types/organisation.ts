/**
 * Organisation-related type definitions.
 */

export type OrganisationStatus = "active" | "suspended" | "deleted";

export interface Organisation {
  id: number;
  name: string;
  logo: string | null;
  bio: string | null;
  status: OrganisationStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface OrganisationPagination {
  page: number;
  limit: number;
  total: number;
}

export interface OrganisationListResponse {
  data: Organisation[];
  pagination: OrganisationPagination;
}

export interface OrganisationPayload {
  name?: string;
  logo?: string | null;
  bio?: string | null;
  status?: OrganisationStatus;
}

export interface ValidationErrorItem {
  path: string;
  message: string;
}
