# Spec: ReturnCopy Deep-Data Moat (R11 vertical-agent pattern)

## 0. Constitution (read)
Mirrors AGENTS.md gates: P0 no-silent-mock (§1), web-research gate (§3),
exclusive cluster (§5), Spec Kit 0→6 (§10), moat reinforcement (§11.5).
Pattern source: `a11yguard/a11y-agent` (exact structural replica, domain-adapted).

## 1. Specify (requirement)
Add a versioned, curated consumer-protection corpus (EU 2011/83/EU, UK CRA 2015 /
CCR 2013, US FTC Cooling-Off + truthful advertising, California ARL, Visa /
Mastercard refund & chargeback) plus a 5-step grounded agent (retrieve →
crossref → assess → cite → report) with honest guardrails (G1–G5) and a
human-in-the-loop data-flywheel. Goal: a defensible "deep-data moat" that a
generic LLM cannot credibly reproduce, surfaced via `?agent=1` while preserving
the existing P0 behavior matrix.

### Acceptance criteria
- `retrieve()` hits the right provision per jurisdiction (EU/UK/US).
- Guardrails refuse ungrounded / absolute-assurance output (G1–G5).
- Flywheel: contributed signals are `verify:true`, `pending_review`, never
  silently merged; only human `accept` makes them retrievable.
- `pages/api/tool.ts` `agent=1` branch added; P0 matrix (503/429/502/200 +
  `source:'Model-assisted'`) preserved exactly; `lib/rules/*.ts`,
  `lib/aiGateway.ts`, `lib/waffo.ts` untouched.
- `tsx` self-test all-green; `node flywheel-demo.mjs` passes; `next build` exits 0.

## 2. Plan (design)
- Datasets: `eu-consumer.json`, `uk-consumer.json`, `us-consumer.json`,
  `frameworks.json` (crosswalk). Uniform `obligations[]` shape
  `{id,ref,title,body,tags,verify}`.
- `governance-data/index.ts`: `retrieve`, `loadGovernanceIndex`,
  `invalidateGovernanceCache`; scope = `eu|uk|us|frameworks`.
- `guardrails.ts`: `applyGuardrails` (G1–G5). `agent-core.ts`: `runReturnAgent`
  (+ `runAgent` alias). `data-flywheel.ts`: `writeback/setStatus/
  loadContributed/getAcceptedContributed/captureRunSignals`.
- API wiring: dynamic `import('../../returncopy-agent/lib/agent-core')` after
  quota check, before classic call; `if (agent && !useMock)`.

## 3. Tasks / DoD
See `tasks.md`.
