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
    const contentType = request.headers.get("content-type") || "";
    
    // Handle FormData (avatar upload with file)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      return proxyRequest({
        path: "/auth/profile",
        method: "PATCH",
        request,
        body: formData,
        isMultipart: true,
      });
    }
    
    // Handle JSON (regular profile updates)
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
