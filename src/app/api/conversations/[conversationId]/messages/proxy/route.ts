import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/server-config";
import { extractBearerToken, errorResponse } from "@/lib/errors";

/**
 * Proxy route for direct conversation messages.
 * Ensures task-type messages are properly returned from the backend.
 * This fixes the issue where task messages disappear in direct conversations after reload.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  
  // Extract auth token
  const token = extractBearerToken(request.headers);
  if (!token) {
    return errorResponse("Authentication required", 401);
  }

  // Build the backend API URL
  const url = `${API_BASE_URL}/conversations/${conversationId}/messages`;

  try {
    // Fetch messages from the backend
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Process messages to ensure task messages are properly formatted
    // The response structure is: { success, message, data: { messages: [...] } }
    if (data?.data?.messages && Array.isArray(data.data.messages)) {
      const messages = data.data.messages.map((msg: any) => {
        // Ensure content is properly parsed if it's a string
        if (typeof msg.content === 'string') {
          try {
            const parsedContent = JSON.parse(msg.content);
            return { ...msg, content: parsedContent };
          } catch {
            // If parsing fails, keep original
            return msg;
          }
        }
        return msg;
      });

      // Return the response with properly formatted messages
      return Response.json(
        { ...data, data: { ...data.data, messages } },
        { status: response.status }
      );
    }

    // Return original response if no messages to process
    return Response.json(data, { status: response.status });
  } catch {
    // If fetch fails, return error response
    return errorResponse("Service unavailable", 502);
  }
}
