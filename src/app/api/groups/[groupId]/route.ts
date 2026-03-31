import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const { groupId } = await params;
  return proxyRequest({
    path: `/groups/${groupId}`,
    method: "GET",
    request,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const contentType = request.headers.get("content-type") || "";
    
    // Handle FormData (logo upload with file)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      return proxyRequest({
        path: `/groups/${groupId}`,
        method: "PATCH",
        request,
        body: formData,
        isMultipart: true,
      });
    }
    
    // Handle JSON (regular group updates)
    const body = await request.json();
    return proxyRequest({
      path: `/groups/${groupId}`,
      method: "PATCH",
      request,
      body,
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
