import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  return proxyRequest({
    path: `/groups/${groupId}/members`,
    method: "GET",
    request,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  try {
    const body = await request.json();

    if (!body.userIds || !Array.isArray(body.userIds)) {
      return errorResponse("userIds array is required", 400);
    }

    return proxyRequest({
      path: `/groups/${groupId}/members`,
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
