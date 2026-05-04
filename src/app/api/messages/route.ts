import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server-proxy";
import { errorResponse } from "@/lib/errors";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.messageIds || !Array.isArray(body.messageIds) || body.messageIds.length === 0) {
      return errorResponse("messageIds is required and must be a non-empty array", 400);
    }
    
    if (body.messageIds.length > 50) {
      return errorResponse("Cannot delete more than 50 messages at once", 400);
    }
    
    // Forward the delete request to the backend
    return proxyRequest({
      path: "/messages",
      method: "DELETE",
      request,
      body,
    });
  } catch (error) {
    console.error("Delete messages proxy error:", error);
    return errorResponse("Invalid request body", 400);
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  
  // Handle multipart/form-data for file uploads
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      
      const clientMessageId = formData.get("clientMessageId") as string | null;
      const receiverPhone = formData.get("receiverPhone") as string | null;
      const groupId = formData.get("groupId") as string | null;
      const file = formData.get("file") as File | null;
      
      // Check for bracket notation: content[type], content[caption]
      const contentType = formData.get("content[type]") as string | null;
      const contentCaption = formData.get("content[caption]") as string | null;
      
      // Also check for JSON string format: content
      const contentStr = formData.get("content") as string | null;
      
      // Build content object from bracket notation OR JSON string
      let contentObj: { type: string; caption?: string };
      if (contentType) {
        contentObj = { type: contentType };
        if (contentCaption) contentObj.caption = contentCaption;
      } else if (contentStr) {
        try {
          contentObj = JSON.parse(contentStr);
        } catch {
          return errorResponse("Invalid content format - must be valid JSON", 400);
        }
      } else {
        return errorResponse("Content is required (content[type] or content field)", 400);
      }
      
      if (!file) {
        return errorResponse("File is required for file messages", 400);
      }
      
      // Forward to backend - let backend handle the content format
      // Try JSON string format first (as per README)
      const contentJsonStr = JSON.stringify(contentObj);
      
      console.log("Forwarding to backend with bracket notation:", {
        clientMessageId,
        receiverPhone,
        groupId,
        contentType,
        contentCaption,
        contentJsonStr,
        fileName: file.name
      });
      
      // Create new FormData and forward
      const newFormData = new FormData();
      if (clientMessageId) newFormData.append("clientMessageId", clientMessageId);
      if (receiverPhone) newFormData.append("receiverPhone", receiverPhone);
      if (groupId) newFormData.append("groupId", groupId);
      newFormData.append("content", contentJsonStr);
      newFormData.append("file", file);
      
      return proxyRequest({
        path: "/messages",
        method: "POST",
        request,
        body: newFormData,
        isMultipart: true,
      });
    } catch (err) {
      console.error("Multipart request error:", err);
      return errorResponse("Invalid multipart request", 400);
    }
  }
  
  // Handle JSON requests (including file uploads with base64)
  try {
    const body = await request.json();

    if (!body.content) {
      return errorResponse("Message content is required", 400);
    }

    // Forward the request to the backend
    return proxyRequest({
      path: "/messages",
      method: "POST",
      request,
      body,
    });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
}
