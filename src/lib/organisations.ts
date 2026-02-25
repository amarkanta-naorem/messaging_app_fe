import { getToken } from "./auth";
import { API_BASE } from "./config";

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

export class ApiError extends Error {
  status: number;
  errors?: ValidationErrorItem[];

  constructor(message: string, status: number, errors?: ValidationErrorItem[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const buildHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

async function parseError(res: Response): Promise<ApiError> {
  let message = "Request failed";
  let errors: ValidationErrorItem[] | undefined;

  try {
    const data = await res.json();
    if (typeof data?.message === "string") {
      message = data.message;
    }
    if (Array.isArray(data?.errors)) {
      errors = data.errors;
    }
  } catch {
    // Ignore JSON parsing errors.
  }

  return new ApiError(message, res.status, errors);
}

export async function getOrganisations(page = 1, limit = 20): Promise<OrganisationListResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/organisations?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}

export async function getOrganisation(organisationId: number): Promise<Organisation> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/organisations/${organisationId}`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}

export async function createOrganisation(payload: OrganisationPayload): Promise<Organisation> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/organisations`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}

export async function updateOrganisation(
  organisationId: number,
  payload: OrganisationPayload
): Promise<Organisation> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/organisations/${organisationId}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}

export async function deleteOrganisation(organisationId: number): Promise<Organisation> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/organisations/${organisationId}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return res.json();
}
