import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  return proxyRequest({
    path: "/auth/profile",
    method: "GET",
    request,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest({
      path: "/auth/profile",
      method: "PATCH",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
