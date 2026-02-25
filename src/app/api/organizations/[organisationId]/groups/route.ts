import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  return proxyRequest({
    path: `/organizations/${organisationId}/groups`,
    method: "GET",
    request,
  });
}
