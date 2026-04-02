import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> }
) {
  const { groupId, userId } = await params;
  return proxyRequest({
    path: `/groups/${groupId}/members/${userId}/assign-admin`,
    method: "PATCH",
    request,
  });
}
