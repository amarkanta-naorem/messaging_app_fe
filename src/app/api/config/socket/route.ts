import { SOCKET_URL } from "@/lib/server-config";

export async function GET() {
  return Response.json({ socketUrl: SOCKET_URL });
}
