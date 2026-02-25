import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  try {
    const body = await request.json();
    return proxyRequest({
      path: `/organizations/${organisationId}/employees`,
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
