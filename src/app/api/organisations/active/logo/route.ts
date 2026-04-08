import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";
import { API_BASE_URL } from "@/lib/server-config";
import { extractBearerToken } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return errorResponse("Content-Type must be multipart/form-data", 400);
  }

  try {
    const formData = await request.formData();
    const logo = formData.get("logo");

    if (!logo || !(logo instanceof File)) {
      return errorResponse("Logo file is required", 400);
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(logo.type)) {
      return errorResponse("Only JPEG, PNG, GIF, and WebP are allowed", 400);
    }

    if (logo.size > 2 * 1024 * 1024) {
      return errorResponse("File size must be less than 2MB", 400);
    }

    const token = extractBearerToken(request.headers);
    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    const url = `${API_BASE_URL}/organisations/active`;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const data = new FormData();
    data.append("logo", logo, logo.name);

    const fetchOptions: RequestInit = {
      method: "PATCH",
      headers,
      body: data,
    };

    const response = await fetch(url, fetchOptions);
    const responseData = await response.json();

    return Response.json(responseData, { status: response.status });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return errorResponse("Invalid form data", 400);
  }
}