TITLE

Install the Operations Automated Steering, Project-Boundary, Prompt-Control and Recovery System

ROLE

You are working on the existing Operations Automated repository and private AI Workbench.

This task establishes the governing instructions that determine how future requests are interpreted, assigned to the correct product, converted into work, implemented and recovered.

This is a control-and-foundation task. It is not permission to redesign the methodology, replace the Workbench, restructure the whole repository or add unrelated product functionality.

CONTEXT

Operations Automated currently contains two tightly connected parts:

1. The Operations Automated Methodology.
2. The private AI Workbench and internal methodology-development system.

These should remain in the same core project for now because the Workbench is the environment in which the Methodology is applied, challenged, improved and released.

The Dynamic Governance Tool is a separate product and should move into a separately controlled project and repository through a non-destructive migration.

Incident Management RPG and Football Manager Player Lab are separate projects and are outside this task.

The following distinction is fundamental:

- Product Purpose explains why a product exists, who it serves, what outcomes it creates and what it must not become.
- Steering instructions explain how AI, the Workbench, Codex, GitHub and connected systems should interpret requests, retain learning, assess scope, recommend new projects, control implementation and preserve recovery.

Do not merge those two concepts into one vague document.

PRIMARY OUTCOME

Create a durable Operations Automated Steering and Collaboration system that:

- keeps every build aligned to an approved Product Purpose;
- tells AI how to interpret natural-language instructions;
- retrieves relevant project memory before proposing work;
- distinguishes methodology changes from product changes;
- detects when a request belongs in a separate project;
- prevents one project from silently absorbing another;
- maintains exact prompt provenance;
- identifies conflicting or superseded instructions;
- preserves existing behaviour and data;
- provides a tested recovery route before material implementation; and
- supports a productive working relationship between the founder, the Workbench, AI assistants and Codex.

NON-NEGOTIABLE ARCHITECTURE

Treat the current architecture as:

A. OPERATIONS AUTOMATED CORE PROJECT

Contains:

- Operations Automated Methodology.
- AI Workbench.
- Internal methodology-development system.
- Methodology challenge and evolution loop.
- Operations Bible.
- Work Profiles.
- Operational memory.
- Ideas Space.
- Decision and Approval controls.
- Implementation Jobs and Codex handoffs.
- Controlled methodology publication.
- Prompt and purpose registry.

B. DYNAMIC GOVERNANCE TOOL

Separate product and repository.

May exchange controlled findings, work references and learning signals with the core project.

Must not share methodology authority, approval authority or database ownership by accident.

C. OUTSIDE THIS PROJECT

- Incident Management RPG.
- Football Manager Player Lab.
- Any future unrelated product.

SOURCE PRECEDENCE

Implement and document the following precedence:

1. Explicit current instruction from the authorised human.
2. Approved Product Purpose and Purpose & Boundaries.
3. Approved Steering and Collaboration Contract.
4. Approved methodology and governance material.
5. Recorded Decisions and Approvals.
6. Current approved implementation prompts.
7. Proposed or draft material, clearly labelled.
8. Operational memory and feedback.
9. AI inference.

A lower source must not silently overrule a higher source.

Where two sources at the same level conflict, surface the conflict rather than selecting the convenient interpretation.

BASELINE AND RECOVERY GATE

Before changing application behaviour:

1. Read:
   - AGENTS.md
   - README.md
   - CHARTER.md
   - GOVERNANCE.md
   - ROADMAP.md
   - PROJECT-PRIORITIES.md
   - current methodology purpose and evolution documents
   - current Workbench product definition
   - current system-architecture document
   - relevant open pull requests and retained decisions

2. Record:
   - current repository and branch;
   - current commit;
   - current working-tree state;
   - current application build version;
   - current database location and schema;
   - current Confluence mappings and publication receipts;
   - relevant local configuration, without copying secrets into Git.

3. Create:
   - a clearly named safety branch;
   - a clearly named baseline tag;
   - a secure database backup outside the tracked repository;
   - a restoration record.

4. Verify:
   - restore the database into a temporary test location;
   - start the Workbench against the restored copy;
   - confirm that conversations, work, Decisions, Approvals and implementation history remain available;
   - record whether recovery succeeded.

5. Do not continue into behavioural changes unless recovery has been demonstrated or the inability to do so has been explicitly surfaced for human decision.

Do not commit private operational data, tokens, secrets or confidential material.

REQUIRED CONTROLLED DOCUMENTS

Create or reconcile the following:

1. STEERING.md

This must contain the approved or proposed Steering and Collaboration Contract.

2. docs/purpose/operations-automated-methodology.md

Product Purpose and Boundaries for the Methodology.

3. docs/purpose/ai-workbench.md

Product Purpose and Boundaries for the Workbench.

4. docs/purpose/dynamic-governance-tool.md

Product Purpose and Boundaries for the separate Governance product.

5. projects/project-registry.yml

At minimum, record:

- project identifier;
- product name;
- purpose-document location;
- repository;
- product owner;
- current status;
- intended users;
- core outcome;
- information boundary;
- authority boundary;
- connected products;
- excluded products;
- release lifecycle;
- prompt registry location.

6. prompts/prompt-registry.yml

At minimum, record:

- prompt identifier;
- title;
- target project;
- target capability;
- exact version;
- status;
- purpose version;
- steering version;
- effective date;
- superseded prompt;
- reason for change;
- approving Decision;
- builds or pull requests that used it;
- migration impact.

7. prompts/approved/
8. prompts/drafts/
9. prompts/superseded/
10. docs/decisions/

Use existing equivalent structures where they already exist. Do not create duplicate sources of truth merely to satisfy a filename.

REQUEST-INTAKE CLASSIFICATION

Create a reusable classification contract for substantive requests.

The possible classifications must include:

- ordinary answer or explanation;
- application of the approved methodology;
- methodology challenge;
- methodology clarification;
- methodology change candidate;
- Workbench product change;
- Governance Tool product change;
- defect or corrective change;
- research or evidence request;
- operational work item;
- idea for later consideration;
- cross-product dependency;
- purpose or boundary change;
- new-project candidate;
- urgent security, safety, legal or authority review;
- no action required.

One natural-language request may create linked candidates in more than one category, but each candidate must preserve its own source, authority, status and decision.

PROJECT-BOUNDARY GATE

Before material implementation, assess:

- primary user;
- primary outcome;
- core data and confidentiality boundary;
- authority and approval model;
- release and operating lifecycle;
- commercial proposition;
- interaction model;
- technology and dependency profile;
- whether the capability would distort the current Product Purpose;
- whether the capability is reusable across multiple products;
- whether it is sufficiently developed to become committed work.

Return one recommendation:

- remain within the current product;
- implement as a bounded module;
- implement as a shared capability;
- create a separate project;
- retain in Ideas Space;
- defer pending evidence;
- reject as inconsistent with the purpose.

Where a new project is recommended, produce:

- proposed product name;
- proposed Product Purpose;
- intended users;
- primary outcome;
- inputs and outputs;
- boundaries and non-goals;
- relationship to existing products;
- data and security implications;
- authority model;
- what remains in the current product;
- migration or integration requirements;
- exact human decision required.

Do not create a new repository or move work solely because it is technically convenient.

PURPOSE-CHANGE CONTROL

A feature request does not change Product Purpose.

An ordinary discussion does not change Product Purpose.

Repeated references do not change Product Purpose.

Only an explicit purpose-review or purpose-change instruction may start that process.

A purpose-change proposal must contain:

- current approved wording;
- proposed wording;
- reason;
- evidence;
- affected users and outcomes;
- affected prompts;
- affected products and integrations;
- migration consequences;
- strongest credible alternative;
- no-change alternative;
- approval required;
- effective date if approved.

PROMPT CONTROL

Material implementation must identify the exact approved prompt version used.

Do not reconstruct approved prompts from conversational memory.

The action “collate my current prompts” must:

- use the prompt registry;
- include only the selected project;
- include only approved/current prompts by default;
- identify drafts separately;
- exclude superseded prompts by default;
- show version, status and effective date;
- identify unresolved conflicts;
- preserve the exact approved text.

CONFLICT DETECTION

Detect and surface:

- approved documents that contradict each other;
- a proposed document describing behaviour that has already changed;
- a build using an outdated purpose or prompt;
- a feature being added to the wrong product;
- one product importing another product’s internal implementation;
- duplicate sources of authority;
- an implementation whose acceptance criteria do not match the intended outcome;
- a database migration without a restore route;
- a Workbench change that weakens the methodology-learning loop;
- a technical completion that is being mistaken for meaning approval or release;
- old instructions that conflict with an explicit later Decision.

AI BEHAVIOUR

AI may:

- classify requests;
- retrieve relevant purpose and memory;
- identify likely scope drift;
- recommend a separate project;
- prepare purpose, scope or prompt proposals;
- identify conflicts;
- prepare implementation plans;
- create bounded work records;
- execute approved low-consequence mechanics.

AI must not:

- change Product Purpose;
- approve methodology meaning;
- infer approval from silence or continued discussion;
- silently resolve a material conflict;
- move a capability between products without a recorded decision;
- merge, publish to Live, spend money, create consequential connections or accept risk without authority;
- delete existing history to simplify the implementation.

WORKBENCH SURFACE

Provide a proportionate Purpose and Steering surface that allows the authorised user to see:

- current products;
- current purpose version;
- boundaries;
- current steering version;
- approved prompt versions;
- unresolved purpose or prompt proposals;
- project-boundary recommendations;
- conflicts;
- recovery status;
- which build used which prompt.

Do not turn this into a large administration product before the underlying control works.

TESTS

At minimum, test:

1. A normal in-scope Workbench request remains in the Workbench.
2. A Governance Tool request is routed to Governance.
3. An Incident Management RPG request is identified as a separate project.
4. A Player Lab request is identified as a separate project.
5. A feature request cannot silently change Product Purpose.
6. A superseded prompt is not selected as current.
7. A build cannot begin without an identifiable purpose and prompt version.
8. A conflicting instruction is surfaced.
9. A restored database can be opened and retains required records.
10. An existing specialist workflow remains available.
11. A rejected new-project recommendation remains traceable.
12. No Product Purpose or prompt receives Approved status without a recorded human decision.

ACCEPTANCE CRITERIA

This task is complete when:

- the project and purpose boundaries are explicit and machine-readable;
- the Methodology and Workbench remain connected;
- Governance is clearly separate without yet being destructively removed;
- requests can be classified and routed;
- new-project recommendations are generated before implementation;
- prompt versions are traceable to builds;
- conflicts are visible;
- the current system has a tested recovery route;
- existing data and histories remain intact;
- no methodology meaning or product purpose has been silently changed;
- all relevant tests pass;
- the work is submitted through a separate branch and draft pull request;
- merge, release and publication remain separate decisions.

RETURN

Return:

1. Current-state findings.
2. Conflicts discovered.
3. Baseline and recovery evidence.
4. Files created or changed.
5. Project-boundary model.
6. Prompt-control model.
7. Tests and results.
8. Anything that remains unsafe or incomplete.
9. Exact human decisions still required.
10. Draft pull-request reference.

Do not merge.
