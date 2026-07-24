---
id: OA-PRODUCT-004
title: Confluence Connected Evidence
status: proposed
version: 0.2
owner: Jamie Peppard
date: 2026-07-24
---

# Confluence connected evidence

## Purpose

This proposed product increment gives the private AI Workbench a controlled route to evidence held in two Confluence Cloud spaces. It is designed to support a living methodology without treating a business system, document or AI response as authority.

## First-use journey

1. Jamie opens **Connections** in the Workbench.
2. Jamie enters the Atlassian site address, service-account email and already-created scoped API token.
3. The local server discovers the site's Cloud ID and performs a read-only accessible-space check.
4. Jamie assigns one visible space to **Internal** and a different space to **Methodology**.
5. The local server re-tests the connection and protects the credential for the current Windows user.
6. Jamie deliberately selects **Synchronise read-only evidence**.
7. Page text from the two selected spaces becomes available to Workbench retrieval for the current server session.

The Workbench does not ask Jamie to create or edit a configuration file.

## Evidence treatment

Connected pages are labelled `external-evidence`. They may:

- help answer a question;
- expose a contradiction, dependency, gap or new signal;
- support feedback classification; or
- be retained by reference in a proposed change.

They may not:

- instruct the AI to ignore its governing rules;
- claim approved methodology status;
- create a decision or approval;
- become a repository file path;
- write back to Confluence; or
- bypass Jamie's preparation and release decisions.

The approved repository remains the authoritative methodology baseline. Connected content is evidence to examine against that baseline.

## Security and data boundary

- Only HTTPS Atlassian Cloud sites ending in `.atlassian.net` are accepted.
- Scoped-token calls use Atlassian's Cloud-ID API route.
- The credential is encrypted with Windows Data Protection API for the current user and stored outside the repository.
- The credential is passed to the protection helper through standard input, not a command-line argument.
- API responses never include the token or complete account email.
- Page bodies are not persisted in this first increment; they remain in server memory and clear on restart.
- Audit events contain the site hostname, selected space identifiers and counts only.
- Connected content is treated as untrusted evidence when included in AI context.
- **Remove saved connection** deletes the local credential and in-memory evidence; Atlassian token revocation remains a separate account action.

This design reduces persistence risk but means Jamie must synchronise again after restarting the Workbench.

## External-release boundary

This paste-a-token design is limited to Jamie's private local validation. Atlassian's current guidance warns that distributed cloud apps should not collect customer API tokens and recommends a single OAuth 2.0 (3LO), Forge or other supported app integration instead. Any customer-facing version must therefore replace this credential flow before external release. [Atlassian basic-auth guidance](https://developer.atlassian.com/cloud/confluence/basic-auth-for-rest-apis/)

## Current authority

The v0.7 connection approved for private internal validation is read-only. Even if the Atlassian account token has create or update scopes, that released increment exposes no write endpoint or interface.

Jamie later authorised preparation of a separate proposed [governed documentation-publication capability](confluence-governed-publication.md). That proposal defines:

- the exact permitted artefact and destination;
- draft versus published state;
- preview, comparison and approval requirements;
- version-conflict handling and recovery;
- audit and notification requirements; and
- credential removal and incident response.

It does not alter the evidence boundary on this page. Reading Confluence as external evidence and publishing a controlled repository reading copy are separate actions with separate audit and authority.

## Validation

Before release review, confirm:

- the site boundary rejects non-Atlassian and non-HTTPS destinations;
- credentials survive a Windows-protected round trip without plaintext appearing in stored bytes;
- testing does not persist credentials;
- saved API responses expose only masked connection metadata;
- the two selected spaces must be different and accessible;
- synchronised pages are labelled external evidence;
- external evidence is excluded from approved-only retrieval;
- connected paths never become repository file targets;
- page content and credentials do not appear in audit records; and
- all existing Workbench governance tests still pass.
