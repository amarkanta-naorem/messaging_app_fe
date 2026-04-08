import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  return proxyRequest({
    path: "/organisations/active",
    method: "GET",
    request,
  });
}

export async function PATCH(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const hasAnyField = Array.from(formData.keys()).length > 0;
      
      if (!hasAnyField) {
        return errorResponse("At least one field must be provided for update", 400);
      }

      return proxyRequest({
        path: "/organisations/active",
        method: "PATCH",
        request,
        body: formData,
        isMultipart: true,
      });
    } catch {
      return errorResponse("Invalid form data", 400);
    }
  }

  try {
    const body = await request.json();
    return proxyRequest({
      path: "/organisations/active",
      method: "PATCH",
      request,
      body,
    });
  } catch {
    return Response.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}