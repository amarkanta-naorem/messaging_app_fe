/**
 * Employee service - client-side.
 * SRP: Handles all employee and contact-related API calls through BFF.
 */

import { get, post } from "./api-client";
import type { Employee, Contact, OrgGroup, GroupDetails, GroupMember } from "@/types";
import type { ApiEnvelope } from "@/types/api";

export async function getOrganizationEmployees(): Promise<Employee[]> {
  const res = await get<ApiEnvelope<Employee[]>>("/contacts/organization");
  return res.data;
}

export async function getContactByPhone(phone: string): Promise<Contact> {
  const res = await get<ApiEnvelope<Contact>>(`/contacts/${phone}/organization`);
  return res.data;
}

export async function getOrganizationGroups(organisationId: number): Promise<OrgGroup[]> {
  const res = await get<ApiEnvelope<OrgGroup[]>>(`/organizations/${organisationId}/groups`);
  return res.data;
}

export interface CreateEmployeePayload {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  groupIds?: number[];
}

export async function createEmployee(
  organisationId: number,
  payload: CreateEmployeePayload
): Promise<Employee> {
  const res = await post<ApiEnvelope<Employee>>(
    `/organizations/${organisationId}/employees`,
    payload
  );
  return res.data;
}

export async function getGroupDetails(groupId: number): Promise<GroupDetails> {
  const res = await get<ApiEnvelope<GroupDetails>>(`/groups/${groupId}`);
  return res.data;
}

export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const res = await get<ApiEnvelope<GroupMember[]>>(`/groups/${groupId}/members`);
  return res.data;
}
