import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function GET(request: NextRequest) {
  return proxyRequest({
    path: "/contacts/organization",
    method: "GET",
    request,
  });
}
