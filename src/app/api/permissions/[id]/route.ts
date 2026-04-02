import { NextRequest } from "next/server";
import { proxyPublicRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://whatclone.globizsapp.com/api"}/permissions/${id}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch {
    return errorResponse("Service unavailable", 502);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    return proxyPublicRequest({
      path: `/permissions/${id}`,
      method: "PATCH",
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = `${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://whatclone.globizsapp.com/api"}/permissions/${id}`;
  try {
    const response = await fetch(url, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    return Response.json(data || { success: true }, { status: response.status });
  } catch {
    return errorResponse("Service unavailable", 502);
  }
}
