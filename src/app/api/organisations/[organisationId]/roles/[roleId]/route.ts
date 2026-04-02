import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; roleId: string }> }
) {
  const { organisationId, roleId } = await params;
  return proxyRequest({
    path: `/organisations/${organisationId}/roles/${roleId}`,
    method: "GET",
    request,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; roleId: string }> }
) {
  const { organisationId, roleId } = await params;
  try {
    const body = await request.json();
    return proxyRequest({
      path: `/organisations/${organisationId}/roles/${roleId}`,
      method: "PATCH",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; roleId: string }> }
) {
  const { organisationId, roleId } = await params;
  return proxyRequest({
    path: `/organisations/${organisationId}/roles/${roleId}`,
    method: "DELETE",
    request,
  });
}
