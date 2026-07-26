import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { workspaces } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export async function workspaceId(email: string) {
  const bytes = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `tester-${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
    const id = await workspaceId(user.email);
    const db = getDb();
    const [record] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);
    return Response.json({ state: record ? JSON.parse(record.state) : null });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load workspace" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
    const id = await workspaceId(user.email);
    const payload = (await request.json()) as { state?: unknown };
    if (!payload.state || typeof payload.state !== "object") {
      return Response.json({ error: "A workspace state is required" }, { status: 400 });
    }
    const serialized = JSON.stringify(payload.state);
    if (serialized.length > 500_000) {
      return Response.json({ error: "Workspace state is too large" }, { status: 413 });
    }
    const db = getDb();
    await db
      .insert(workspaces)
      .values({ id, state: serialized })
      .onConflictDoUpdate({
        target: workspaces.id,
        set: { state: serialized, updatedAt: new Date().toISOString() },
      });
    return Response.json({ saved: true, savedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save workspace" },
      { status: 500 },
    );
  }
}
