/**
 * Organisations module - wraps the organisation service.
 * Kept for backward compatibility - delegates to services.
 *
 * DEPRECATED: Import directly from @/services/organisation.service instead.
 */

import * as organisationService from "@/services/organisation.service";
import type { Organisation, OrganisationListResponse, OrganisationPayload, OrganisationStatus, ValidationErrorItem, OrganisationPagination } from "@/types";

export type { OrganisationStatus, Organisation, OrganisationPagination, OrganisationListResponse, OrganisationPayload, ValidationErrorItem };

export class ApiError extends Error {
  status: number;
  errors?: ValidationErrorItem[];
  constructor(message: string, status: number, errors?: ValidationErrorItem[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const getOrganisations = organisationService.getOrganisations;
export const getOrganisation = organisationService.getOrganisation;
export const createOrganisation = organisationService.createOrganisation;
export const updateOrganisation = organisationService.updateOrganisation;
export const deleteOrganisation = organisationService.deleteOrganisation;
