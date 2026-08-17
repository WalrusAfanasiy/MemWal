# Walrus Session 7 — BuildMEM V2

This folder contains my Walrus Session 7 improvement of **Prompt #4 — BuildMEM Agent**.

## Files

- [BUILDMEM_V2_IMPROVED.md](./BUILDMEM_V2_IMPROVED.md) — the full improved prompt, ready to use.
- [BUILDMEM_V2_IMPROVEMENT_NOTES.md](./BUILDMEM_V2_IMPROVEMENT_NOTES.md) — detailed explanation of every change, why it was needed, and the A/B/C real-world results.

## Original prompt

Upstream BuildMEM Agent:

https://github.com/Olalekan2345/buildmem-agent/blob/main/CLAUDE.md

## Core improvement

The original BuildMEM is designed to preserve engineering decisions, failures, fixes, and session continuity. During real use on a long-running PlantSearch / Lemana PRO importer, I found that the prompt could promote an early assumption or workaround into durable memory before it had actually been verified.

BuildMEM V2 introduces a **verification-first memory lifecycle**:

```text
failure
→ normalized error signature
→ root cause remains unknown
→ fix remains unproven
→ investigate
→ verify
→ only then promote to proven reusable memory
```

It also adds scoped recall, stable memory keys, deduplication, a feedback lifecycle, critical-path protection, performance/coverage integrity, and tighter rules around the existing write budget.

## Six-store operational comparison

| Metric | A — no BuildMEM | B — original BuildMEM | C — BuildMEM V2 |
|---|---:|---:|---:|
| Processing time | 3:12:24 | 4:29:33 | 4:31:30 |
| Pages | 2,664 | 2,197 | 2,681 |
| Products processed | 154,552 | 127,024 | 155,689 |
| Offers saved | 30,113 | 24,940 | 29,990 |
| Duplicates prevented | 124,379 | 102,084 | 125,699 |
| Product errors | 60 | 0 | 0 |
| Failure events | 0 | 1 | 0 |
| Seconds/page | 4.33 | 7.36 | 6.07 |
| Pages/hour | 830.8 | 489.0 | 592.5 |
| Offers/hour | 9,390.7 | 5,551.5 | 6,627.6 |

Compared with original BuildMEM, V2 processed about **22.0% more pages**, **22.6% more products**, saved **20.2% more offers**, and achieved about **19.4% higher offer throughput**, while keeping **product errors at zero**.

These are operational results from a real workflow; they are not presented as a laboratory claim that every performance difference was caused by the prompt alone.

## Core proposal

> **BuildMEM should not only remember engineering experience; it should track whether that experience has actually been verified and whether it still applies to the current context.**
