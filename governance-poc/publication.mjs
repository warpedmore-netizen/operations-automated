import { createHash } from "node:crypto";
import { generateDocuments, audit } from "./domain.mjs";

const clone = value => structuredClone(value);
const timestamp = () => new Date().toISOString();
const hash = value => createHash("sha256").update(value).digest("hex");
const documentTitles = { policy: "Incident Management Policy", procedure: "Incident Management Procedure", releaseNotes: "Release notes" };

export const platformProfiles = {
  confluence: {
    platform: "confluence", hierarchy: "space-and-parent-page", contentModel: "storage-page-body", concurrencyToken: "version-number",
    requiredCapabilities: ["read-page", "write-page"], supportsAtomicBodyUpdate: true, permissionBoundary: "page and space permissions"
  },
  notion: {
    platform: "notion", hierarchy: "workspace-parent-page-or-data-source", contentModel: "page-properties-and-blocks", concurrencyToken: "last-edited-time",
    requiredCapabilities: ["read-content", "update-content", "insert-content"], supportsAtomicBodyUpdate: false, permissionBoundary: "connection capability and shared page ancestry"
  }
};

function ensure(state) {
  state.publicationTargets ??= [
    { id: "PUB-CONF-001", platform: "confluence", name: "Mock Confluence controlled space", containerId: "SPACE-DEMO", parentId: "PAGE-GOVERNANCE", status: "mock-connected", capabilities: clone(platformProfiles.confluence) },
    { id: "PUB-NOTION-001", platform: "notion", name: "Mock Notion operations workspace", containerId: "WORKSPACE-DEMO", parentId: "PAGE-OPERATIONS", status: "mock-connected", capabilities: clone(platformProfiles.notion) }
  ];
  state.publicationMappings ??= [];
  state.remoteDocuments ??= [];
  state.publicationChecks ??= [];
  return state;
}

export function registerMapping(input, { targetId, documentKey, actor }) {
  const state = ensure(clone(input));
  if (!actor?.trim()) throw new Error("A named human owner is required");
  if (!documentTitles[documentKey]) throw new Error("Unsupported generated document");
  const target = state.publicationTargets.find(item => item.id === targetId);
  if (!target) throw new Error("Publication target not found");
  if (state.publicationMappings.some(item => item.targetId === targetId && item.documentKey === documentKey)) return state;
  const remoteId = target.platform === "confluence" ? `CONF-${documentKey.toUpperCase()}-001` : `NOTION-${documentKey.toUpperCase()}-001`;
  state.publicationMappings.push({ id: `MAP-${String(state.publicationMappings.length + 1).padStart(3, "0")}`, targetId, documentKey, remoteId, owner: actor, status: "mapped", lastPublishedReleaseId: null, lastPublishedHash: null, remoteRevision: null });
  audit(state, actor, "publication-mapping-created", "PublicationMapping", remoteId, `Mapped ${documentTitles[documentKey]} to ${target.platform}`);
  return state;
}

export function checkDrift(input, mappingId, actor = "Publication monitor") {
  const state = ensure(clone(input));
  const mapping = state.publicationMappings.find(item => item.id === mappingId);
  if (!mapping) throw new Error("Publication mapping not found");
  const generated = generateDocuments(state)[mapping.documentKey];
  const remote = state.remoteDocuments.find(item => item.targetId === mapping.targetId && item.remoteId === mapping.remoteId);
  const status = !remote ? "not-published" : remote.contentHash === hash(generated) ? "in-sync" : "drifted";
  const check = { id: `SYNC-${String(state.publicationChecks.length + 1).padStart(3, "0")}`, mappingId, checkedAt: timestamp(), status, generatedHash: hash(generated), remoteHash: remote?.contentHash ?? null, remoteRevision: remote?.revision ?? null };
  state.publicationChecks.push(check);
  audit(state, actor, "publication-drift-checked", "PublicationMapping", mapping.id, status);
  return state;
}

export function publishDocument(input, mappingId, actor) {
  const state = ensure(clone(input));
  if (!actor?.trim() || actor.toLowerCase().includes("ai")) throw new Error("A named human publisher is required; AI cannot publish");
  const mapping = state.publicationMappings.find(item => item.id === mappingId);
  const target = state.publicationTargets.find(item => item.id === mapping?.targetId);
  if (!mapping || !target) throw new Error("Publication mapping not found");
  const release = state.releases.at(-1);
  if (!release || !release.approvedBy) throw new Error("Only an approved release can be published");
  const content = generateDocuments(state)[mapping.documentKey];
  const current = state.remoteDocuments.find(item => item.targetId === target.id && item.remoteId === mapping.remoteId);
  if (current && mapping.remoteRevision !== null && current.revision !== mapping.remoteRevision) throw new Error("Remote content changed after the last controlled publication; review drift before publishing");
  const revision = target.platform === "confluence" ? (current?.revision ?? 0) + 1 : timestamp();
  const translated = target.platform === "confluence"
    ? { representation: "storage", value: content, version: revision, spaceId: target.containerId, parentId: target.parentId }
    : { representation: "blocks", blocks: content.split("\n\n").filter(Boolean), lastEditedTime: revision, parentPageId: target.parentId };
  const record = { targetId: target.id, remoteId: mapping.remoteId, title: documentTitles[mapping.documentKey], content, contentHash: hash(content), revision, translated, updatedAt: timestamp(), updatedBy: actor };
  if (current) Object.assign(current, record); else state.remoteDocuments.push(record);
  mapping.lastPublishedReleaseId = release.id; mapping.lastPublishedHash = record.contentHash; mapping.remoteRevision = revision; mapping.status = "published";
  audit(state, actor, "approved-document-published", "PublicationMapping", mapping.id, `Published ${mapping.documentKey} to ${target.platform} from ${release.id}`);
  return state;
}

export function simulateRemoteEdit(input, mappingId, actor) {
  const state = ensure(clone(input));
  const mapping = state.publicationMappings.find(item => item.id === mappingId);
  const target = state.publicationTargets.find(item => item.id === mapping?.targetId);
  const remote = state.remoteDocuments.find(item => item.targetId === mapping?.targetId && item.remoteId === mapping?.remoteId);
  if (!remote || !target) throw new Error("Publish the document before simulating a remote edit");
  remote.content += `\n\nUncontrolled remote edit by ${actor}.`; remote.contentHash = hash(remote.content); remote.updatedAt = timestamp(); remote.updatedBy = actor;
  remote.revision = target.platform === "confluence" ? remote.revision + 1 : timestamp();
  audit(state, actor, "remote-edit-observed", "PublicationMapping", mapping.id, "Mock external edit created for drift testing");
  return state;
}
