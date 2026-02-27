import { NextRequest } from "next/server";
import { proxyPublicRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

/**
 * Invite Verification API
 * POST /api/invites/verify
 * 
 * Proxies to external backend API to verify an invitation code.
 * This endpoint is public (no authentication required).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim() === "") {
      return errorResponse("Invite code is required", 400);
    }

    // Proxy to external API - the backend handles invite verification
    return proxyPublicRequest({
      path: "/invites/verify",
      method: "POST",
      body: { code: code.trim() },
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
