/**
 * ReturnCopy vertical ruleset — deterministic quality checks for AI-drafted return/refund
 * policies and customer-facing return replies. Runs BEFORE / alongside the model so the
 * verdict is explainable and not dependent on LLM output alone (no silent mock).
 *
 * Domain grounding (web-research gate, §3):
 *  - EU Consumer Rights Directive 2011/83/EU: 14-day right of withdrawal for distance/e-commerce
 *    sales; no reason needed; refund within 14 days of receipt; seller CANNOT charge a restocking
 *    fee for withdrawal (only return postage in some cases). "Final sale / no returns" cannot strip
 *    this statutory right for EU/UK consumers.
 *  - FTC honest-advertising: do not make false promises about refunds/approvals; claims must be true.
 *  - GDPR Art. 5(1)(c) data minimisation: do not leak PII in the policy text.
 *  - Empathetic, professional tone improves customer trust (consumer-experience best practice).
 *
 * Ruleset MUST carry RULESET_VERSION (date-stamped) and every rule a `ref`.
 */
export const RULESET_VERSION = 'return-copy@2026-07-22'

export type ReturnRule = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  /** Returns true when the policy/reply FAILS the check (a problem was found). */
  check: (ctx: ReturnAuditContext) => boolean
  remediation: string
  ref: string
}

export type ReturnAuditContext = {
  text: string
  storeInfo: string
  tone: string
  reason: string
}

const REF_EU = 'https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm'
const REF_CRD = 'https://www.termsfeed.com/blog/return-refund-laws-eu/'
const REF_FTC = 'https://www.ftc.gov/business-guidance/advertising-marketing/truthful-advertising'
const REF_GDPR = 'https://gdpr-info.eu/art-5/'

// Clear refund timeline (e.g. "within 5 business days", "14 days").
const TIMELINE_PATTERN = /\b(\d+\s*(business\s*)?days?|within\s+\d+|immediate(ly)?)\b.*(refund|return|process|issue)/i

// Statutory-rights stripping: "final sale", "no returns", "all sales final", "no refunds".
const STRIP_PATTERN =
  /\b(all sales (are )?final|final sale|no (returns?|refunds?)|strictly no return|non-?refundable)/i

// Restocking fee charged for withdrawal.
const RESTOCK_PATTERN = /\brestock(ing)?\s*fee\b/i

// False promise / guaranteed approval.
const FALSE_PROMISE_PATTERN =
  /\b(guarantee|100%|always|never (fail|miss|reject)|we (will )?(always|100%) (approve|refund))\b/i

// PII leak.
const PII_PATTERN =
  /\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]*?){13,16}\b|\b(sk-[a-z0-9]{12,}|password|ssn)\b/i

export const RETURN_RULES: ReturnRule[] = [
  {
    id: 'RETURN-TIME-001',
    title: 'Clear refund timeline stated',
    severity: 'medium',
    check: (ctx) => !TIMELINE_PATTERN.test(ctx.text),
    remediation:
      'State an explicit refund timeline (e.g. "refund within 5 business days of receipt"). Consumers need a concrete commitment (CRD 2011/83/EU).',
    ref: REF_CRD,
  },
  {
    id: 'RETURN-STRIP-002',
    title: 'No stripping of statutory withdrawal rights',
    severity: 'high',
    check: (ctx) => STRIP_PATTERN.test(ctx.text) && !/14[\s-]?day|withdraw|cooling[\s-]?off/i.test(ctx.text),
    remediation:
      'Do not state "final sale / no returns / no refunds" without also disclosing the 14-day right of withdrawal for EU/UK consumers. Statutory rights cannot be waived for distance sales (CRD 2011/83/EU).',
    ref: REF_EU,
  },
  {
    id: 'RETURN-RESTOCK-003',
    title: 'No restocking fee on withdrawal',
    severity: 'high',
    check: (ctx) => RESTOCK_PATTERN.test(ctx.text),
    remediation:
      'Under the EU right of withdrawal you may not charge a restocking fee. Remove it, or limit fees to non-withdrawal cases (e.g. worn/item-not-as-described returns) clearly.',
    ref: REF_EU,
  },
  {
    id: 'RETURN-PROMISE-004',
    title: 'No false refund/approval promises (honesty rule)',
    severity: 'medium',
    check: (ctx) => FALSE_PROMISE_PATTERN.test(ctx.text),
    remediation:
      'Avoid absolute promises ("guarantee", "100%", "always approved"). State the real eligibility. The tool does not guarantee refund approval (FTC truthful advertising).',
    ref: REF_FTC,
  },
  {
    id: 'RETURN-PII-005',
    title: 'No PII leaked (GDPR data minimisation)',
    severity: 'high',
    check: (ctx) => PII_PATTERN.test(ctx.text),
    remediation:
      'Remove SSN, card numbers, passwords, or API keys from the policy/reply. Under GDPR Art. 5(1)(c) minimise personal data in shared content.',
    ref: REF_GDPR,
  },
  {
    id: 'RETURN-TONE-006',
    title: 'Empathetic, professional tone',
    severity: 'low',
    check: (ctx) => !/\b(sorry|apolog|understand|thank|happy to help|here to help|appreciate)\b/i.test(ctx.text),
    remediation:
      'Use empathetic language ("Sorry it wasn’t the right fit — we’ve made the exchange easy"). Empathy protects trust and repeat sales.',
    ref: REF_FTC,
  },
]

/** Aggregate deterministic check — returns Rule-based findings + honesty flag. */
export function runReturnDomainChecks(ctx: ReturnAuditContext) {
  const hits = RETURN_RULES.filter((r) => r.check(ctx)).map((r) => ({
    id: r.id,
    title: r.title,
    severity: r.severity,
    remediation: r.remediation,
    source: 'Rule-based' as const,
    ref: r.ref,
  }))
  const falsePromise = FALSE_PROMISE_PATTERN.test(ctx.text)
  return {
    rulesetVersion: RULESET_VERSION,
    falsePromise,
    hits,
  }
}

export type RuleHit = {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  passed: boolean
  remediation?: string
  ref?: string
}

export function runDeterministicChecks(inputs: Record<string, string>): RuleHit[] {
  const text = inputs.policy || inputs.text || inputs.message || Object.values(inputs || {}).join('\n')
  const result = runReturnDomainChecks({
    text,
    storeInfo: inputs.storeInfo || inputs.store || '',
    tone: inputs.tone || 'professional',
    reason: inputs.reason || '',
  } as ReturnAuditContext)
  const hits = (result as any).hits || []
  if (!hits.length) {
    return [{ id: 'R0', title: 'Return copy inputs accepted', severity: 'low', passed: text.trim().length > 0 }]
  }
  return hits.map((h: any) => ({
    id: String(h.id || 'R'),
    title: String(h.title || 'check'),
    severity: (h.severity as 'low' | 'medium' | 'high') || 'medium',
    passed: false,
    remediation: h.remediation,
    ref: h.ref,
  }))
}
