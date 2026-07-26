import { env } from "cloudflare:workers";

export const connectorIds = ["confluence", "notion", "googleDocs", "word"] as const;
export type ConnectorId = (typeof connectorIds)[number];

type RuntimeBindings = {
  CONFLUENCE_BASE_URL?: string;
  CONFLUENCE_ACCESS_TOKEN?: string;
  NOTION_ACCESS_TOKEN?: string;
  GOOGLE_ACCESS_TOKEN?: string;
  MICROSOFT_GRAPH_ACCESS_TOKEN?: string;
};

type ConnectorProfile = {
  id: ConnectorId;
  configured: boolean;
  readCapability: string;
  writeCapability: string;
  requiredBindings: string[];
};

function bindings() {
  return env as unknown as RuntimeBindings;
}

export function connectorProfiles(): ConnectorProfile[] {
  const runtime = bindings();
  return [
    {
      id: "confluence",
      configured: Boolean(runtime.CONFLUENCE_BASE_URL && runtime.CONFLUENCE_ACCESS_TOKEN),
      readCapability: "Page metadata, ancestry, version and storage body",
      writeCapability: "Version-aware page update after governed release",
      requiredBindings: ["CONFLUENCE_BASE_URL", "CONFLUENCE_ACCESS_TOKEN"],
    },
    {
      id: "notion",
      configured: Boolean(runtime.NOTION_ACCESS_TOKEN),
      readCapability: "Page metadata, properties and child blocks",
      writeCapability: "Guarded property and block reconciliation after governed release",
      requiredBindings: ["NOTION_ACCESS_TOKEN"],
    },
    {
      id: "googleDocs",
      configured: Boolean(runtime.GOOGLE_ACCESS_TOKEN),
      readCapability: "Document structure and revision metadata",
      writeCapability: "Atomic batch update with revision control after governed release",
      requiredBindings: ["GOOGLE_ACCESS_TOKEN"],
    },
    {
      id: "word",
      configured: Boolean(runtime.MICROSOFT_GRAPH_ACCESS_TOKEN),
      readCapability: "Microsoft Graph drive-item metadata and content stream",
      writeCapability: "Controlled DOCX upload after governed release",
      requiredBindings: ["MICROSOFT_GRAPH_ACCESS_TOKEN"],
    },
  ];
}

function assertReference(reference: unknown) {
  if (typeof reference !== "string" || !reference.trim() || reference.length > 300) {
    throw new ConnectorError(400, "A valid document or page ID is required.");
  }
  return encodeURIComponent(reference.trim());
}

async function requestJson(url: string, headers: HeadersInit) {
  const response = await fetch(url, { headers, redirect: "follow" });
  const text = await response.text();
  let value: unknown = text;
  try {
    value = JSON.parse(text);
  } catch {
    // Some document services return a non-JSON stream. The probe reports only
    // metadata and never exposes document content or credentials.
  }
  if (!response.ok) {
    throw new ConnectorError(
      response.status,
      `The remote service returned ${response.status}. Check the reference and minimum read permissions.`,
    );
  }
  return value;
}

export async function probeConnector(id: ConnectorId, reference: unknown) {
  const runtime = bindings();
  const encoded = assertReference(reference);
  const profile = connectorProfiles().find((item) => item.id === id);
  if (!profile?.configured) throw new ConnectorError(409, "This connector has not been configured by the service owner.");

  if (id === "confluence") {
    const base = new URL(runtime.CONFLUENCE_BASE_URL!);
    if (base.protocol !== "https:") throw new ConnectorError(500, "Confluence must use an HTTPS base URL.");
    const page = await requestJson(
      `${base.origin}${base.pathname.replace(/\/$/, "")}/wiki/api/v2/pages/${encoded}?body-format=storage`,
      { Accept: "application/json", Authorization: `Bearer ${runtime.CONFLUENCE_ACCESS_TOKEN}` },
    ) as Record<string, unknown>;
    return { id, reference, title: page.title ?? "Untitled page", version: (page.version as Record<string, unknown> | undefined)?.number ?? null, status: page.status ?? null };
  }

  if (id === "notion") {
    const page = await requestJson(`https://api.notion.com/v1/pages/${encoded}`, {
      Accept: "application/json",
      Authorization: `Bearer ${runtime.NOTION_ACCESS_TOKEN}`,
      "Notion-Version": "2026-03-11",
    }) as Record<string, unknown>;
    return { id, reference, object: page.object ?? "page", lastEditedTime: page.last_edited_time ?? null, archived: page.archived ?? false };
  }

  if (id === "googleDocs") {
    const document = await requestJson(`https://docs.googleapis.com/v1/documents/${encoded}`, {
      Accept: "application/json",
      Authorization: `Bearer ${runtime.GOOGLE_ACCESS_TOKEN}`,
    }) as Record<string, unknown>;
    return { id, reference, title: document.title ?? "Untitled document", revisionId: document.revisionId ?? null, tabs: Array.isArray(document.tabs) ? document.tabs.length : null };
  }

  const item = await requestJson(`https://graph.microsoft.com/v1.0/me/drive/items/${encoded}`, {
    Accept: "application/json",
    Authorization: `Bearer ${runtime.MICROSOFT_GRAPH_ACCESS_TOKEN}`,
  }) as Record<string, unknown>;
  return { id, reference, title: item.name ?? "Untitled file", eTag: item.eTag ?? null, size: item.size ?? null, webUrl: item.webUrl ?? null };
}

export class ConnectorError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
