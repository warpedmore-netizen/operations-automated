---
status: proposed
owner: Operations Automated Governance Authority
---
# Notion integration

The mock adapter translates an approved generated document into page properties and content blocks beneath a configured parent page. It uses the remote page's last-edited time as its concurrency signal and records the target page, published release and content hash.

A real connection would require only the minimum read, update and insert capabilities needed for the selected workflow. Access also depends on the relevant parent page being shared with the connection. Body replacement needs guarded block reconciliation rather than assuming Confluence-style atomic page-body semantics. Remote changes stop automated publication for human review.

Credentials, workspace/page selection, content exchanged, retention, permission changes, rate limits, recovery and removal require explicit approval before connection.
