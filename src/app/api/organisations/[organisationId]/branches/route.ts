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
    return proxyRequest({
      path: `/organisations/${organisationId}/branches`,
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
