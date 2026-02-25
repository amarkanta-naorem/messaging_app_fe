import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  const { phone } = await params;
  return proxyRequest({
    path: `/contacts/${phone}/organization`,
    method: "GET",
    request,
  });
}
