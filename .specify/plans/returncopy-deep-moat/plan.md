# Plan: ReturnCopy Deep-Data Moat

## File-level changes
| File | Change |
|---|---|
| `returncopy-agent/lib/governance-data/eu-consumer.json` | NEW — 4 EU CRD 2011/83/EU obligations |
| `returncopy-agent/lib/governance-data/uk-consumer.json` | NEW — 4 UK CRA 2015 / CCR 2013 obligations |
| `returncopy-agent/lib/governance-data/us-consumer.json` | NEW — 5 US FTC / California ARL / Visa / Mastercard obligations |
| `returncopy-agent/lib/governance-data/frameworks.json` | NEW — 3 crosswalk obligations |
| `returncopy-agent/lib/governance-data/index.ts` | NEW — `retrieve` / `loadGovernanceIndex` / `invalidateGovernanceCache` |
| `returncopy-agent/lib/guardrails.ts` | NEW — `applyGuardrails` (G1–G5) |
| `returncopy-agent/lib/agent-core.ts` | NEW — `runReturnAgent` (+`runAgent`), 5-step runner |
| `returncopy-agent/lib/data-flywheel.ts` | NEW — writeback / setStatus / loadContributed / getAcceptedContributed / captureRunSignals |
| `returncopy-agent/lib/__selftest.ts` | NEW — deterministic self-test |
| `returncopy-agent/flywheel-demo.mjs` | NEW — idempotent demo loop (truncate, no unlink) |
| `returncopy/pages/api/tool.ts` | EDIT — add `agent?: boolean`; insert `agent=1` branch after quota check |
| `returncopy/lib/rules/SOURCES.md` | NEW — authoritative refs |

## Dependencies / constraints
- Reuse `OPENAI_BASE_URL`, `OPENAI_MODEL`, `defaultModel()` from existing stack.
- `resolveJsonModule` already enabled; datasets read via `fs.readFileSync`.
- No edits to `lib/aiGateway.ts`, `lib/waffo.ts`, `lib/rules/*.ts`.
- Sandbox: never `fs.unlinkSync`/`fs.rmdirSync`; truncate logs with `writeFileSync('')`.

## Verify recipe (Spec Kit step 5)
1. `tsx returncopy-agent/lib/__selftest.ts` → ALL GREEN.
2. `node returncopy-agent/flywheel-demo.mjs` → loop verified.
3. `NODE_OPTIONS=--max-old-space-size=2048 node_modules/.bin/next build` → "Compiled successfully".
4. Cleanup empty `contributed/feedback-log.jsonl` after tests.
