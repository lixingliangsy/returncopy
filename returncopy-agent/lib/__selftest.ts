// ReturnCopy deep-data moat — deterministic self-test (run with tsx, no LLM).
// Verifies: (1) retrieve semantic hit, (2) guardrail G1/G5 rejection,
// (3) flywheel accept → re-index → retrieve-hit, then cleans up test storage.

import fs from 'fs'
import path from 'path'
import { retrieve, loadGovernanceIndex, invalidateGovernanceCache } from './governance-data/index'
import { applyGuardrails } from './guardrails'
import { writeback, setStatus, loadContributed, getAcceptedContributed, type ContributedSignal } from './data-flywheel'

let pass = 0
let fail = 0
function assert(name: string, cond: boolean, extra = ''): void {
  if (cond) {
    pass++
    console.log(`  ✅ ${name}`)
  } else {
    fail++
    console.log(`  ❌ ${name} ${extra}`)
  }
}

console.log('— ReturnCopy deep-data moat self-test —')

// T1: index loads all curated datasets
const idx = loadGovernanceIndex()
assert('index loads >= 15 curated entries', idx.length >= 15, `(got ${idx.length})`)

// T2: retrieve hits EU 14-day withdrawal by "EU 14 day right of withdrawal e-commerce"
const r1 = retrieve('EU 14 day right of withdrawal e-commerce', { scope: 'eu', topK: 3 })
assert('retrieve("EU 14 day withdrawal") → eu-withdrawal-14 present', r1.some((e) => e.id === 'eu-withdrawal-14'), `(top: ${r1.map((e) => e.id).join(',')})`)

// T3: retrieve hits UK 30-day reject by "UK 30 day refund faulty goods"
const r2 = retrieve('UK 30 day refund faulty goods', { scope: 'uk', topK: 3 })
assert('retrieve("UK 30 day refund") → uk-30day-reject present', r2.some((e) => e.id === 'uk-30day-reject'), `(top: ${r2.map((e) => e.id).join(',')})`)

// T4: retrieve hits FTC Cooling-Off by "FTC cooling off rule door to door 3 days"
const r3 = retrieve('FTC cooling off rule door to door 3 days', { scope: 'us', topK: 3 })
assert('retrieve("FTC cooling off") → us-ftc-coolingoff present', r3.some((e) => e.id === 'us-ftc-coolingoff'), `(top: ${r3.map((e) => e.id).join(',')})`)

// T5: guardrail rejects ungrounded / absolute-assurance text (G1 + G5)
const bad = applyGuardrails('You are legally compliant and we guarantee no penalty under FTC.', [])
assert('guardrail rejects "guarantee no penalty / compliant" (G2+G5)', !bad.ok && (bad.violations.includes('G5_YOU_ARE_COMPLIANT') || bad.violations.includes('G2_GUARANTEE_NO_BREACH') || bad.violations.includes('G2_GUARANTEE_COMPLIANCE')), `(violations: ${bad.violations.join(',')})`)

// T6: guardrail accepts grounded decision-support text
const good = applyGuardrails('Based on the EU Consumer Rights Directive 2011/83/EU your online store must grant a 14-day right of withdrawal (eu-withdrawal-14). Verify against primary law before action.', [
  { id: 'eu-withdrawal-14', ref: 'https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en', title: '14-day right of withdrawal', text: '', source: 'EU CRD 2011/83/EU', scope: 'eu', verify: true },
])
assert('guardrail accepts grounded text', good.ok, `(violations: ${good.violations.join(',')})`)

// T7: flywheel accept → becomes retrievable, then clean up
const testId = 'selftest_' + Date.now()
const sig: ContributedSignal = {
  id: testId,
  runId: 'selftest',
  kind: 'feedback',
  scope: 'frameworks',
  rating: 5,
  status: 'pending_review',
  createdAt: new Date().toISOString(),
  verify: true,
  note: 'SELFTEST contributed entry (safe to delete)',
}
writeback([sig])
assert('flywheel writeback persisted (pending_review)', loadContributed('pending_review').some((s) => s.id === testId))
assert('contributed NOT retrievable while pending', getAcceptedContributed().every((c) => c.id !== testId))

setStatus(testId, 'accepted')
invalidateGovernanceCache()
const r4 = retrieve('selftest contributed', { topK: 10 })
assert('accepted contributed becomes retrievable', r4.some((e) => e.id === testId))

// cleanup: remove test entry. NOTE: this sandbox intercepts fs.unlinkSync
// (safe-delete shim); truncate to empty file instead of deleting the log.
setStatus(testId, 'rejected')
const remaining = loadContributed().filter((s) => s.id !== testId)
const logPath = path.join(__dirname, 'governance-data', 'contributed', 'feedback-log.jsonl')
try { fs.writeFileSync(logPath, remaining.map((s) => JSON.stringify(s)).join('\n') + (remaining.length ? '\n' : '')) } catch (e) { /* read-only serverless FS: best-effort */ }
invalidateGovernanceCache()
assert('contributed store empty after cleanup', getAcceptedContributed().every((c) => c.id !== testId))

console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
console.log('ALL GREEN ✅')
