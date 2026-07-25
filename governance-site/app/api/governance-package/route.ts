import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { workspaces } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { workspaceId } from "../workspace/route";

type PackageDocument = {
  id?: unknown;
  title?: unknown;
  documentType?: unknown;
  status?: unknown;
  content?: unknown;
  sources?: unknown;
  destination?: unknown;
};

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
    if (!record) return Response.json({ error: "Create and review a governance package first" }, { status: 404 });

    const workspace = JSON.parse(record.state) as {
      organisation?: Record<string, unknown>;
      authority?: Record<string, unknown>;
      package?: PackageDocument[];
    };
    const documents = (Array.isArray(workspace.package) ? workspace.package : [])
      .filter((item) => item?.status === "accepted")
      .map((item) => ({
        id: String(item.id || ""),
        title: String(item.title || ""),
        documentType: String(item.documentType || ""),
        status: "proposed",
        destination: "Internal / Draft",
        sources: Array.isArray(item.sources) ? item.sources.map(String) : [],
        content: String(item.content || ""),
      }))
      .filter((item) => item.id && item.title && item.content);
    if (!documents.length) {
      return Response.json({ error: "Include at least one reviewed document in the Draft hand-off" }, { status: 409 });
    }
    const payload = {
      schemaVersion: "1",
      packageType: "connected-governance-draft-handoff",
      status: "proposed",
      generatedAt: new Date().toISOString(),
      organisation: workspace.organisation || {},
      authority: workspace.authority || {},
      destination: { role: "internal", lifecycle: "draft" },
      documents,
      controls: {
        approvalGranted: false,
        livePromotionGranted: false,
        deletionEnabled: false,
        automaticPublication: false,
        credentialIncluded: false,
      },
    };
    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"operations-automated-governance-draft-handoff.json\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to prepare the governance package" },
      { status: 500 },
    );
  }
}
