import { get } from "./api-client";

export interface PostalCodeResponse {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
}

export interface PostalCodeError {
  message: string;
  code?: string;
  allowManualEntry?: boolean;
}

export async function lookupPostalCode(postalCode: string): Promise<PostalCodeResponse | null> {
  if (!postalCode || postalCode.length < 2) {
    return null;
  }

  try {
    const response = await get<PostalCodeResponse>(`/postal-code?code=${encodeURIComponent(postalCode)}`);
    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; allowManualEntry?: boolean };
    if (err.allowManualEntry) {
      return null;
    }
    return null;
  }
}