import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/errors";
import { proxyRequest } from "@/lib/server-proxy";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const { messageId } = await params;
    
    if (!messageId || isNaN(Number(messageId))) {
      return errorResponse("Invalid message ID", 400);
    }

    return proxyRequest({ path: `/messages/${messageId}`, method: "DELETE", request });
  } catch (error) {
    console.error("Delete message proxy error:", error);
    return errorResponse("Internal server error", 500);
  }
}