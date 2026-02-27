import { NextRequest } from "next/server";
import { proxyPublicRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phone || typeof body.phone !== "string") {
      return errorResponse("Phone number is required", 400);
    }

    return proxyPublicRequest({
      path: "/otp/send",
      method: "POST",
      body: { phone: body.phone },
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
