# BuildMEM V2 — Improvement Notes and Rationale

## Context

This document explains the reasoning behind **BuildMEM Agent V2**, an improvement of the original BuildMEM prompt created for developers, founders, and hackathon builders using persistent memory through Walrus Memory (MemWal).

The goal was not to make the agent remember more. The goal was to make persistent engineering memory **more selective, verifiable, scoped, and safe to reuse** during long-running real-world work.

The prompt was tested while working on a real PlantSearch importer for Lemana PRO. Three operational variants were compared:

- **A — no BuildMEM**
- **B — original BuildMEM**
- **C — improved BuildMEM V2**

For the final six-store comparison, the results were:

| Metric | A — no BuildMEM | B — original BuildMEM | C — BuildMEM V2 |
|---|---:|---:|---:|
| Processing time | 3:12:24 | 4:29:33 | 4:31:30 |
| Pages | 2,664 | 2,197 | 2,681 |
| Products processed | 154,552 | 127,024 | 155,689 |
| Offers saved | 30,113 | 24,940 | 29,990 |
| Duplicates prevented | 124,379 | 102,084 | 125,699 |
| Product errors | 60 | 0 | 0 |
| Failure events | 0 | 1 | 0 |
| Seconds per page | 4.33 | 7.36 | 6.07 |
| Pages per hour | 830.8 | 489.0 | 592.5 |
| Offers per hour | 9,390.7 | 5,551.5 | 6,627.6 |

Compared with the original BuildMEM variant, V2 processed about **22.0% more pages**, **22.6% more products**, saved about **20.2% more offers**, increased offer throughput by about **19.4%**, and kept product errors at **zero**.

These measurements are operational evidence from a real workflow. They should not be interpreted as a laboratory proof that every performance difference was caused by the prompt alone.

---

## 1. Memory is no longer treated as an unquestioned source of truth

### Original problem

The original BuildMEM tells the agent to treat persistent memory as its “single source” of accumulated engineering and product experience.

That is useful for continuity, but risky in long-running projects. A past memory may be:

- incomplete;
- based on an early assumption;
- valid only for another environment;
- tied to another software version;
- superseded by newer evidence.

### V2 change

V2 explicitly says that memory supports the primary task but does not replace:

- current evidence;
- verification;
- project files;
- logs;
- the user's latest instructions.

A recalled memory must be checked against the current project, component, environment, error signature, and software version before use.

### Why it matters

Persistent memory becomes prior experience, not an automatic command.

---

## 2. Failure memories now have a verification lifecycle

### Original problem

The original prompt says that when a failure occurs, the agent should record the symptom, root cause, and fix.

In real debugging, the root cause and fix are often not known when the first exception appears. This creates a risk that a hypothesis or temporary workaround is stored as a confirmed lesson.

### V2 change

A new failure starts with:

```json
{
  "root_cause": "unknown",
  "proven_fix": null,
  "outcome": "unresolved"
}
```

A fix becomes `proven_fix` only after the expected result has been verified.

### Why it matters

The system no longer turns guesses into durable engineering truth.

---

## 3. Memory schema 2.0 adds engineering context

### Original problem

The original schema contains project-level information, but it does not reliably distinguish similar problems across different components or environments.

### V2 change

The schema adds:

- `schema_version`
- `component`
- `environment`
- `scope`
- `memory_key`
- `error_signature`
- `root_cause`
- `proven_fix`
- `verification`
- `outcome`

### Why it matters

A memory can now answer not only “what happened?” but also:

- where it happened;
- under what conditions;
- whether the cause was confirmed;
- whether the fix was verified;
- whether the problem is still unresolved.

---

## 4. Deduplication is explicit and scoped

### Original problem

The original prompt says not to store information that is already remembered, but it does not define a stable way to identify repeated failures.

A recurring importer error can therefore create repeated memories with slightly different wording.

### V2 change

Before writing, V2 performs one scoped recall using:

- project;
- component;
- type;
- `memory_key` or `error_signature`.

The same failure signature is stored at most once per session unless new verified evidence appears.

### Why it matters

Persistent memory stores lessons instead of repeated occurrences.

---

## 5. Feedback becomes an operational lifecycle

### Original problem

`feedback` already exists as a valid memory type in the original schema, but the prompt does not define when it should be created or how it should update prior knowledge.

### V2 change

Feedback is written only when reusable new evidence appears, for example when:

- a recalled fix succeeds in a new environment;
- the old fix fails;
- the confirmed root cause changes;
- a better verified fix is found;
- an old memory becomes obsolete.

### Why it matters

Memory can evolve instead of only accumulating older advice.

---

## 6. Recall is narrowly scoped

### Original problem

Semantic similarity alone can return a technically similar memory from the wrong project, component, or environment.

### V2 change

Recall is narrowed in this order:

1. exact project;
2. exact component;
3. current environment;
4. exact error signature or action;
5. newest relevant verified memories.

### Why it matters

A correct fix for the wrong context is still a wrong fix.

---

## 7. Memory is kept outside high-frequency critical paths

### Original problem

The original prompt does not explicitly prevent an implementation from recalling or remembering inside loops that process every item, page, API response, or repeated failure.

For a long-running importer, that can make memory itself a performance bottleneck or a new point of failure.

### V2 change

V2 prohibits remember/recall inside high-frequency loops and moves memory activity to safe checkpoints:

- session start;
- task/run start;
- completed milestone;
- new unique error signature;
- risky action;
- session end.

### Why it matters

Persistent memory supports the workflow instead of becoming the workflow.

---

## 8. Temporary MemWal failure does not stop reversible work

### Original problem

If memory infrastructure is unavailable, a naïve implementation can stop ordinary work even when the operation is reversible.

### V2 change

For reversible work, a temporary memory timeout or connection problem is deferred until the next safe checkpoint.

For irreversible actions — such as production deploys, wallet transactions, destructive migrations, secret rotation, or submissions — recall remains mandatory.

### Why it matters

The prompt distinguishes ordinary work from genuinely risky operations.

---

## 9. Recalled fixes must pass an applicability check

### Original problem

The original prompt says to recall and apply a previous fix when a problem resembles an earlier failure.

That is too permissive when software versions, environments, or components have changed.

### V2 change

Before using a recalled fix, the agent must verify:

- project;
- component;
- environment;
- error signature;
- software version.

Then it applies the smallest relevant proven fix and verifies the result.

### Why it matters

Recall becomes evidence that informs action rather than an automatic replay mechanism.

---

## 10. Performance and coverage integrity are part of the prompt

### Original problem

A memory-enabled workflow may appear better simply because it processed less work or stopped early.

Counting only raw errors can hide this.

### V2 change

V2 requires comparisons to consider:

- work attempted;
- work completed;
- items processed;
- duration;
- throughput;
- skipped work;
- task errors;
- infrastructure failures.

It also explicitly states that zero errors do not prove improvement if zero work was processed.

### Why it matters

The prompt makes it harder to “win” a comparison by doing less work.

---

## 11. The three-write budget is made stricter

### Original problem

The original BuildMEM already limits durable writes to three per hour, but allows failures to bypass that limit.

A repeated failure can therefore create too many writes.

### V2 change

A critical failure may exceed the default budget only when:

- its error signature is unique in the current session;
- it is likely to recur;
- it contains reusable information;
- it is not already stored.

Repeated occurrences of the same failure never bypass the limit.

### Why it matters

This is an improvement of an existing rule, not a brand-new feature. It closes a loophole that becomes visible in repetitive real-world workflows.

---

## 12. Negative evidence must remain visible

### Original problem

After a successful recovery, it is easy for an agent to summarize the final state and effectively erase the failed attempts that led there.

### V2 change

V2 explicitly requires the agent to preserve failures and regressions in the evidence and never rewrite measured results to make an approach look better.

### Why it matters

The resulting engineering history is auditable.

---

# Real-world result

The most important result was not that BuildMEM V2 became the fastest variant.

The no-memory baseline remained faster in raw throughput, but produced **60 product errors**.

The original BuildMEM eliminated product errors, but the six-store comparison processed only **127,024 products** and saved **24,940 offers**.

BuildMEM V2 kept product errors at **zero** while processing **155,689 products** and saving **29,990 offers**.

Compared with the original prompt, V2 therefore restored substantial coverage and throughput while preserving the zero-product-error result.

This is the practical reason for the rewrite: persistent memory became more useful when it was required to be **scoped, deduplicated, verified, and kept outside the critical path**.

---

# Core proposal in one sentence

> **BuildMEM should not only remember engineering experience; it should track whether that experience has actually been verified and whether it still applies to the current context.**
