import { proxyJson } from "@/lib/proxy";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyJson("/api/sports");
}
