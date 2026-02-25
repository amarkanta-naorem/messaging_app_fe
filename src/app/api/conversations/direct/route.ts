import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.targetUserId || typeof body.targetUserId !== "number") {
      return errorResponse("targetUserId is required", 400);
    }

    return proxyRequest({
      path: "/conversations/direct",
      method: "POST",
      request,
      body: { targetUserId: body.targetUserId },
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
