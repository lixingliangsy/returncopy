# Tasks: ReturnCopy Deep-Data Moat

## T1 — Curated datasets (DoD: 4 JSON files, 16 entries total, all `verify:true`, real web-researched refs)
- [ ] `eu-consumer.json` (4): 14-day withdrawal, 14-day refund, no restocking fee, exceptions
- [ ] `uk-consumer.json` (4): 30-day reject, repair/replace, 14-day cancel, services care
- [ ] `us-consumer.json` (5): FTC cooling-off, FTC truthful ads, CA ARL, Visa refund, MC chargeback
- [ ] `frameworks.json` (3): EU↔UK, card≠statutory, US federal+state

## T2 — Index + retrieve (DoD: `retrieve/loadGovernanceIndex/invalidateGovernanceCache` exported, scope `eu|uk|us|frameworks`)
- [ ] `governance-data/index.ts` mirrors a11yguard, adapted dataset names/scopes

## T3 — Guardrails (DoD: `applyGuardrails` rejects G1/G2/G3/G5, accepts grounded text)
- [ ] `guardrails.ts` G1–G5, `DECISION_SUPPORT_FOOTER`/`UNCERTAINTY_FOOTER`

## T4 — Agent core (DoD: `runReturnAgent` 5-step; redline + non-fatal flywheel capture)
- [ ] `agent-core.ts`; export `runAgent` alias

## T5 — Data flywheel (DoD: accepted-only retrievable; `verify:true`; never auto-merge)
- [ ] `data-flywheel.ts`: writeback/setStatus/loadContributed/getAcceptedContributed/captureRunSignals

## T6 — Self-test + demo (DoD: all-green, idempotent, self-cleaning via truncate)
- [ ] `__selftest.ts`, `flywheel-demo.mjs`

## T7 — API wiring (DoD: `agent=1` branch after quota; P0 matrix preserved; lib/aiGateway|waffo|rules untouched)
- [ ] `pages/api/tool.ts`

## T8 — Sources (DoD: SOURCES.md lists all authoritative URLs)
- [ ] `lib/rules/SOURCES.md`

## T9 — Verify & cleanup (DoD: tsx green, node demo pass, next build 0, empty contributed/)
- [ ] run tsx / node / next build; truncate `contributed/feedback-log.jsonl`
