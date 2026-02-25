import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  return proxyRequest({
    path: `/groups/${groupId}`,
    method: "GET",
    request,
  });
}
