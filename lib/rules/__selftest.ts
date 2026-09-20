/* Deterministic self-test for ReturnCopy rules engine (no LLM). */
import { RETURN_RULES, RULESET_VERSION, runReturnDomainChecks } from './return-rules'

let pass = 0
let fail = 0
function assert(name: string, cond: boolean) {
  if (cond) {
    pass++
    console.log('  PASS ' + name)
  } else {
    fail++
    console.log('  FAIL ' + name)
  }
}

// AC-1: ruleset version dated
assert('RULESET_VERSION present & dated', /^return-copy@\d{4}-\d{2}-\d{2}$/.test(RULESET_VERSION))

// AC-2: no refund timeline
const noTime = { text: 'We accept returns. Contact us.', storeInfo: 'apparel', tone: 'Warm', reason: 'wrong size' }
const noTimeRes = runReturnDomainChecks(noTime)
assert('missing timeline flagged', noTimeRes.hits.some((h) => h.id === 'RETURN-TIME-001'))

// AC-3: statutory-rights stripping without disclosure
const strip = { text: 'All sales are final. No returns, no refunds.', storeInfo: 'apparel', tone: 'Neutral', reason: '' }
const stripRes = runReturnDomainChecks(strip)
assert('statutory-rights strip flagged', stripRes.hits.some((h) => h.id === 'RETURN-STRIP-002'))

// AC-4: restocking fee on withdrawal
const restock = { text: 'We charge a 15% restocking fee on all returns.', storeInfo: 'electronics', tone: 'Neutral', reason: '' }
const restockRes = runReturnDomainChecks(restock)
assert('restocking fee flagged', restockRes.hits.some((h) => h.id === 'RETURN-RESTOCK-003'))

// AC-5: false promise
const promise = { text: 'We guarantee 100% your refund is always approved.', storeInfo: 'apparel', tone: 'Warm', reason: '' }
const promiseRes = runReturnDomainChecks(promise)
assert('false promise flagged', promiseRes.falsePromise === true && promiseRes.hits.some((h) => h.id === 'RETURN-PROMISE-004'))

// AC-6: PII leak
const pii = { text: 'Your SSN 123-45-6789 and card 4111111111111111 on file.', storeInfo: 'apparel', tone: 'Warm', reason: '' }
const piiRes = runReturnDomainChecks(pii)
assert('PII hit detected', piiRes.hits.some((h) => h.id === 'RETURN-PII-005'))

// AC-7: clean compliant policy passes high/medium
const clean = {
  text: 'Returns within 30 days, unworn with tags. Refund to original method within 5 business days of receipt. Sorry it was not the right fit — we have made the exchange easy. Thank you for shopping with us.',
  storeInfo: 'apparel boutique',
  tone: 'Warm',
  reason: 'wrong size',
}
const cleanRes = runReturnDomainChecks(clean)
assert('clean policy: no high/medium hits', !cleanRes.hits.some((h) => ['RETURN-STRIP-002', 'RETURN-RESTOCK-003', 'RETURN-PII-005', 'RETURN-PROMISE-004', 'RETURN-TIME-001'].includes(h.id)))

// AC-8: every rule has ref + hits labeled Rule-based
assert('every rule has ref', RETURN_RULES.every((r) => typeof r.ref === 'string' && r.ref.startsWith('http')))
assert('hits carry source Rule-based', piiRes.hits.every((h) => h.source === 'Rule-based'))

console.log(`\nSELFTEST ${fail === 0 ? 'ALL PASS' : 'HAS FAILURES'} — pass=${pass} fail=${fail}`)
if (fail > 0) process.exit(1)
