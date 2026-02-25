import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

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
