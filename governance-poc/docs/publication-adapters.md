---
status: proposed
owner: Jamie Peppard
---
# Publication adapters

## Common governed contract

The core service maps a generated document to a target, confirms an approved release, renders deterministically, compares content hashes, detects drift, requires a named human publisher and records the publication or conflict. Remote tools are delivery and collaboration surfaces, not canonical governance stores.

Each adapter declares its hierarchy, content model, permission boundary, concurrency token and supported operations. A new adapter must implement translation and remote read/write behaviour without weakening core release or approval rules.

## Confluence profile

Documents map to pages beneath a space and optional parent page. Publication translates Markdown into the target page representation and uses the remote page version as an optimistic concurrency token. Real operation requires page and space read/update permission. A divergent remote version stops publication for review.

## Notion profile

Documents map to pages beneath a parent page or data source. Publication translates the generated view into page properties and blocks. Read, update and insert capabilities are distinct and access also depends on the page being shared with the connection. `last_edited_time` is used as the conflict signal because the page model does not mirror Confluence version numbers.

## Extension route

SharePoint, Google Drive/Docs or another knowledge tool can be added by describing the same capabilities and implementing read, translate and write operations. Action systems such as Jira should use a separate action-adapter contract rather than being forced into the document-publication model.

No live connection, credential, external publication or data exchange is authorised by this design.
