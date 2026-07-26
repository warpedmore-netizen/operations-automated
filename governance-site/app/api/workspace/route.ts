import { getChatGPTUser } from "../../chatgpt-auth";
import { loadWorkspace, saveWorkspace } from "../../../lib/workspace";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
    return Response.json({ state: await loadWorkspace(user.email) });
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
    const payload = (await request.json()) as { state?: unknown };
    if (!payload.state || typeof payload.state !== "object") {
      return Response.json({ error: "A workspace state is required" }, { status: 400 });
    }
    const savedAt = await saveWorkspace(user.email, payload.state as Record<string, unknown>);
    return Response.json({ saved: true, savedAt });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save workspace" },
      { status: 500 },
    );
  }
}
