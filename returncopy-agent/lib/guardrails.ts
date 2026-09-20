import type { GovEntry } from './governance-data/index'

/**
 * Honest guardrails for the ReturnCopy vertical return/refund-compliance agent
 * (returncopy deep-data moat). Aligned to OPC asset guardrails G1–G5.
 *
 * These validators run AFTER the grounded model call returns, BEFORE the
 * report is assembled and emitted. A failing validator refuses emission —
 * matching the existing "no citation / no false-denial → refuse" red line.
 *
 *   G1 — analysis is decision-support, not legal advice / compliance certificate
 *   G2 — no "replace your legal counsel" / "guarantee compliance / guaranteed approval"
 *   G3 — refund/return exposure is a public reference point, never a promise the
 *        tool will keep the user under any penalty or that a refund is guaranteed
 *   G4 — English B2B positioning (enforced at content/design layer, not runtime)
 *   G5 — return/refund copy is a drafting aid; must not claim legally certified / guaranteed outcome
 */

export interface GuardrailResult {
  ok: boolean
  violations: string[]
  note: string
  needsHumanReview: boolean
}

const DECISION_SUPPORT_FOOTER =
  '\n\n— Decision-support only. Not legal advice. Verify against primary law (EU 2011/83/EU, UK CRA 2015 / CCR 2013, US FTC / California ARL, Visa / Mastercard rules) before action. ' +
  'This is a good-faith drafting aid you can stand behind, not a legal compliance certificate.'

const UNCERTAINTY_FOOTER =
  '\n\n⚠️ Open uncertainties detected — confirm with qualified counsel before action.' + DECISION_SUPPORT_FOOTER

// G2 / G5 — prohibited absolute-assurance phrasing. Anchored to avoid false
// positives on mentions of standards (e.g. "EU 14-day right" as a topic).
const PROHIBITED_PHRASES: Array<{ re: RegExp; code: string }> = [
  { re: /\bguarantee[ds]?\b[^.]{0,40}\b(compliance|compliant|no (violation|penalty|liability)|conformity|approval|refund)\b/i, code: 'G2_GUARANTEE_COMPLIANCE' },
  { re: /\byou (are|will be|have been) (legally compliant|fully compliant|guaranteed a refund)\b/i, code: 'G5_YOU_ARE_COMPLIANT' },
  { re: /\b(this|we|it) (certifies?|certify) (your|the (policy|store|business)|compliance|conformity)\b/i, code: 'G5_CERTIFIED' },
  { re: /\breplace (your )?(legal|consumer-protection) (counsel|expert|team|advisor)\b/i, code: 'G2_REPLACE_TEAM' },
  { re: /\bguarantee[ds]? (no (violation|penalty|suit|rejection)|100%|eliminate all risk|zero risk|approved)\b/i, code: 'G2_GUARANTEE_NO_BREACH' },
  { re: /\b(ensures?|guarantees?) (your )?(full |legal )?(compliance|conformity|refund|approval)\b/i, code: 'G5_ENSURE_COMPLIANCE' },
  { re: /\b(always|100%) (approved?|refunded?|compliant)\b/i, code: 'G5_ALWAYS_APPROVED' },
]

// G3 — exposure ceilings must be framed as public reference points, never as a
// promise that the tool will keep the user under them.
const PENALTY_PROMISE: RegExp =
  /\b(we |this (tool|report) |the agent )(will|can|guarantees?) (keep|ensure|get) (you|your (store|company|business)) (under|below|within).*(penalt|fine|damage|suit|liability)/i

// G1 — the report must be grounded in at least one cited provision from the dataset.
const CITATION_MARKER = /EU|Consumer Rights Directive|2011\/83|CRD|UK|Consumer Rights Act|2015|cra2015|CCR|Consumer Contracts|FTC|Cooling-Off|California|Automatic Renewal|ARL|Visa|Mastercard|chargeback|Art\.|Cl\.|Annex|Directive|Reg\.|§|legislation\.gov\.uk|commission\.europa\.eu|ftc\.gov|oag\.ca\.gov|visa\.com|mastercard\.com/i

const UNCERTAINTY_MARKER =
  /\b(uncertain|not certain|may not (be|apply)|verify with|consult (a|your|qualified)|should confirm|depends on|open (question|issue)|needs? (human|legal|expert) review|cannot (determine|confirm)|out of scope)\b/i

/** G1 — report is grounded in at least one cited provision from the dataset. */
export function checkCitationGrounded(report: string, citations: GovEntry[]): boolean {
  return citations.length > 0 && CITATION_MARKER.test(report)
}

/** G2 / G5 — scan for prohibited absolute-assurance phrasing. */
export function checkNoGuarantee(text: string): string[] {
  const hits: string[] = []
  for (const p of PROHIBITED_PHRASES) {
    if (p.re.test(text)) hits.push(p.code)
  }
  if (PENALTY_PROMISE.test(text)) hits.push('G3_PENALTY_PROMISE')
  return hits
}

/** Uncertainty detector — drives the "confirm with counsel" flag (G1/G5). */
export function detectUncertainty(text: string): boolean {
  return UNCERTAINTY_MARKER.test(text)
}

/** Main entry — returns whether the report may be emitted, plus the redline note. */
export function applyGuardrails(report: string, citations: GovEntry[]): GuardrailResult {
  const violations: string[] = []

  if (!checkCitationGrounded(report, citations)) {
    violations.push('G1_NO_CITATION')
  }
  violations.push(...checkNoGuarantee(report))

  const needsHumanReview = detectUncertainty(report)
  const ok = violations.length === 0

  let note = DECISION_SUPPORT_FOOTER
  if (needsHumanReview) {
    note = UNCERTAINTY_FOOTER
  }

  return { ok, violations, note, needsHumanReview }
}
