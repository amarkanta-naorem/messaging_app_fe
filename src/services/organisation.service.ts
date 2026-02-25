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
  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
}

export async function getOrganisation(organisationId: number): Promise<Organisation> {
  const res = await get<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`);
  return res.data;
}

export async function createOrganisation(payload: OrganisationPayload): Promise<Organisation> {
  const res = await post<ApiEnvelope<Organisation>>("/organisations", payload);
  return res.data;
}

export async function updateOrganisation(
  organisationId: number,
  payload: OrganisationPayload
): Promise<Organisation> {
  const res = await patch<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`, payload);
  return res.data;
}

export async function deleteOrganisation(organisationId: number): Promise<Organisation> {
  const res = await del<ApiEnvelope<Organisation>>(`/organisations/${organisationId}`);
  return res.data;
}

export class OrganisationApiError extends AppError {
  errors?: Array<{ path: string; message: string }>;
  constructor(message: string, status: number, errors?: Array<{ path: string; message: string }>) {
    super(message, status, errors);
    this.errors = errors;
  }
}

export function mapApiError(error: unknown): OrganisationApiError {
  if (error instanceof AppError) {
    return new OrganisationApiError(error.message, error.status, error.errors);
  }
  return new OrganisationApiError("An error occurred", 500);
}
