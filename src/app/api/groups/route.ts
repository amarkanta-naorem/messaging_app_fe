import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== "string") {
      return errorResponse("Group name is required", 400);
    }

    return proxyRequest({
      path: "/groups",
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
