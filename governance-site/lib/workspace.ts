import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { workspaces } from "../db/schema";

export async function workspaceId(email: string) {
  const bytes = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `tester-${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export async function loadWorkspace(email: string): Promise<Record<string, unknown> | null> {
  const db = getDb();
  const [record] = await db.select().from(workspaces).where(eq(workspaces.id, await workspaceId(email))).limit(1);
  return record ? JSON.parse(record.state) as Record<string, unknown> : null;
}

export async function saveWorkspace(email: string, state: Record<string, unknown>) {
  const serialized = JSON.stringify(state);
  if (serialized.length > 1_500_000) throw Object.assign(new Error("Workspace state is too large"), { status: 413 });
  const db = getDb();
  await db.insert(workspaces).values({ id: await workspaceId(email), state: serialized }).onConflictDoUpdate({
    target: workspaces.id,
    set: { state: serialized, updatedAt: new Date().toISOString() },
  });
  return new Date().toISOString();
}
