---
status: proposed
owner: Operations Automated Governance Authority
---
# AI integration

`MockAIProvider` exposes scenario analysis and deliberately throws if asked to apply a suggestion. Each suggestion stores input, output, provider, model identifier, generated time, label and human review decision.

A real provider would implement the same interface behind a separately approved server-side connection. Before connecting it, decide purpose, information boundary, retention, provider terms, model/version controls, prompt-injection handling, evaluation, cost, failure behaviour and removal. Suggestions remain untrusted until human acceptance; the provider never receives approval authority.
