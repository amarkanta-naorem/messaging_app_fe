/**
 * Organisation service - client-side.
 * SRP: Handles all organisation-related API calls through BFF.
 */

import { get, post, patch, del } from "./api-client";
import type { Organisation, OrganisationListResponse, OrganisationPayload } from "@/types";
import type { ApiEnvelope } from "@/types/api";
import { AppError } from "@/lib/errors";

export async function getOrganisations(page = 1, limit = 20): Promise<OrganisationListResponse> {
  const res = await get<ApiEnvelope<{ data: Organisation[]; pagination: { page: number; limit: number; total: number } }>>(
    `/organisations?page=${page}&limit=${limit}`
  );
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
}

export async function getOrganisation(organisationId: number): Promise<Organisation> {
  const res = await get<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function createOrganisation(payload: OrganisationPayload): Promise<Organisation> {
  const res = await post<ApiEnvelope<Organisation>>("/organisations", payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updateOrganisation(
  organisationId: number,
  payload: OrganisationPayload
): Promise<Organisation> {
  const res = await patch<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`, payload);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function deleteOrganisation(organisationId: number): Promise<Organisation> {
  const res = await del<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`);
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export class OrganisationApiError extends AppError {
  errors?: Array<{ field: string; message: string }>;
  constructor(message: string, status: number, errors?: Array<{ field: string; message: string }>) {
    super(message, status, errors);
    this.errors = errors;
  }
}

export interface ActiveOrganisationResponse {
  organisation: {
    id: number;
    name: string;
    displayName: string | null;
    address: string | null;
    contactEmail: string | null;
    metadata: Record<string, unknown> | null;
    logo: string | null;
    bio: string | null;
    status: string;
    createdAt: string;
    updatedAt: string | null;
  };
  membership: {
    userId: number;
    organisationId: number;
    role: string;
    status: string;
    joinedAt: string;
  };
}

export interface OrganisationUpdatePayload {
  name?: string;
  displayName?: string;
  address?: string;
  contactEmail?: string;
  metadata?: Record<string, unknown>;
  logo?: File;
}

export async function getActiveOrganisation(): Promise<ActiveOrganisationResponse> {
  const res = await get<ApiEnvelope<ActiveOrganisationResponse>>("/organisations/active");
  if (!res.data) {
    throw new Error("Invalid response from server");
  }
  return res.data;
}

export async function updateActiveOrganisation(payload: OrganisationUpdatePayload): Promise<ActiveOrganisationResponse> {
  const hasData = payload.name || payload.displayName || payload.address || payload.contactEmail || payload.metadata;
  const hasLogo = payload.logo !== undefined;
  
  if (!hasData && !hasLogo) {
    throw new Error("At least one field must be provided for update");
  }

  const formData = new FormData();
  
  if (payload.name) formData.append("name", payload.name);
  if (payload.displayName) formData.append("displayName", payload.displayName);
  if (payload.address) formData.append("address", payload.address);
  if (payload.contactEmail) formData.append("contactEmail", payload.contactEmail);
  if (payload.metadata) formData.append("metadata", JSON.stringify(payload.metadata));
  if (payload.logo) formData.append("logo", payload.logo);

  const url = "/api/organisations/active";
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to update organisation");
  }
  
  return data as ActiveOrganisationResponse;
}

export function mapApiError(error: unknown): OrganisationApiError {
  if (error instanceof AppError) {
    return new OrganisationApiError(error.message, error.status, error.errors);
  }
  return new OrganisationApiError("An error occurred", 500);
}
