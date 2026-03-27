import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

/**
 * Proxy route for direct conversation messages.
 * Uses the same reliable proxy pattern as group messages to ensure
 * consistent persistence behavior for all message types.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  return proxyRequest({
    path: `/conversations/${conversationId}/messages`,
    method: "GET",
    request,
  });
}
