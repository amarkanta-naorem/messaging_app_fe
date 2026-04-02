import { NextRequest } from "next/server";
import { proxyPublicRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const url = `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://whatclone.globizsapp.com/api"}/permissions${query ? `?${query}` : ""}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch {
    return errorResponse("Service unavailable", 502);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return proxyPublicRequest({
      path: "/permissions",
      method: "POST",
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
