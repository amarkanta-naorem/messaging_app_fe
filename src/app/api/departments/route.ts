import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return proxyRequest({
    path: `/departments`,
    method: "GET",
    request,
    query: query || undefined,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyRequest({
      path: `/departments`,
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}