import { getChatGPTUser } from "../../chatgpt-auth";
import {
  ConnectorError,
  connectorIds,
  connectorProfiles,
  probeConnector,
  type ConnectorId,
} from "../../../lib/connectors";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  return Response.json({
    connectors: connectorProfiles().map((profile) => ({
      id: profile.id,
      configured: profile.configured,
      readCapability: profile.readCapability,
      writeCapability: profile.writeCapability,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in is required" }, { status: 401 });
  try {
    const payload = (await request.json()) as { connector?: string; reference?: unknown };
    if (!connectorIds.includes(payload.connector as ConnectorId)) {
      return Response.json({ error: "Unknown connector" }, { status: 400 });
    }
    const result = await probeConnector(payload.connector as ConnectorId, payload.reference);
    return Response.json({ checkedAt: new Date().toISOString(), result });
  } catch (error) {
    const status = error instanceof ConnectorError ? error.status : 500;
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to test the connector" },
      { status },
    );
  }
}
