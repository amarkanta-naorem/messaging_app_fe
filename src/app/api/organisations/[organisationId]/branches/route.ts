import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return proxyRequest({
    path: `/organisations/${organisationId}/branches`,
    method: "GET",
    request,
    query: query || undefined,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  try {
    const body = await request.json();

    // Build payload with only defined values
    const payload: Record<string, unknown> = {};

    // Required fields
    if (body.name !== undefined) payload.name = body.name;

    // Optional string fields
    if (body.code !== undefined) payload.code = body.code;
    if (body.address !== undefined) payload.address = body.address;
    if (body.city !== undefined) payload.city = body.city;
    if (body.state !== undefined) payload.state = body.state;
    if (body.country !== undefined) payload.country = body.country;
    if (body.postalCode !== undefined) payload.postalCode = body.postalCode;
    if (body.phone !== undefined) payload.phone = body.phone;
    if (body.email !== undefined) payload.email = body.email;

    // Numeric fields - only include if defined and valid
    if (body.latitude !== undefined) {
      const lat = Number(body.latitude);
      if (!isNaN(lat)) {
        payload.latitude = lat;
      }
    }
    if (body.longitude !== undefined) {
      const lng = Number(body.longitude);
      if (!isNaN(lng)) {
        payload.longitude = lng;
      }
    }

    // Boolean fields
    if (body.isHeadquarters !== undefined) payload.isHeadquarters = body.isHeadquarters;

    // Status field
    if (body.status !== undefined) payload.status = body.status;

    // Manager ID - include if defined and valid
    if (body.managerId !== undefined) {
      const mgrId = Number(body.managerId);
      if (!isNaN(mgrId)) {
        payload.managerId = mgrId;
      }
    }

    return proxyRequest({
      path: `/organisations/${organisationId}/branches`,
      method: "POST",
      request,
      body: payload,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
