import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";

  return proxyRequest({
    path: "/organisations",
    method: "GET",
    request,
    query: `page=${page}&limit=${limit}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest({
      path: "/organisations",
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
