/**
 * Service layer exports.
 * All services use the BFF API client for secure communication.
 */

// Re-export api-client methods (HTTP primitives)
export { get, post, patch, del } from "./api-client";

// Re-export auth service
export {
  sendOtp,
  resendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  getToken as getAuthToken,
  setToken as setAuthToken,
  removeToken as removeAuthToken,
  getUser as getAuthUser,
  setUser as setAuthUser,
  removeUser as removeAuthUser,
} from "./auth.service";

// Re-export conversation service
export { getConversations, createDirectConversation } from "./conversation.service";

// Re-export message service
export { getMessages, getGroupMessages, sendMessage } from "./message.service";

// Re-export organisation service (need to rename ApiError to avoid conflict)
import * as orgService from "./organisation.service";
export const getOrganisations = orgService.getOrganisations;
export const getOrganisation = orgService.getOrganisation;
export const createOrganisation = orgService.createOrganisation;
export const updateOrganisation = orgService.updateOrganisation;
export const deleteOrganisation = orgService.deleteOrganisation;
export const OrganisationApiError = orgService.OrganisationApiError;
export const mapApiError = orgService.mapApiError;

// Re-export employee service
export {
  getOrganizationEmployees,
  getContactByPhone,
  getOrganizationGroups,
  createEmployee,
  getGroupDetails,
  getGroupMembers,
} from "./employee.service";

// Re-export group service
import * as groupService from "./group.service";
export const createGroup = groupService.createGroup;
export const getGroup = groupService.getGroup;
export const addGroupMembers = groupService.addGroupMembers;
