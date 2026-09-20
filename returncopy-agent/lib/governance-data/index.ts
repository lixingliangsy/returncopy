import fs from 'fs'
import path from 'path'
import { getAcceptedContributed } from '../data-flywheel'

export interface GovEntry {
  id: string
  ref: string
  title: string
  text: string
  source: string
  scope: GovScope
  verify?: boolean
}

export type GovScope = 'eu' | 'uk' | 'us' | 'frameworks'

interface FlatEntry {
  id: string
  ref: string
  title: string
  text: string
  source: string
  scope: GovScope
  verify?: boolean
}

const DATA_DIR = __dirname
const STOP = new Set([
  'the', 'a', 'an', 'of', 'to', 'and', 'or', 'for', 'in', 'on', 'is', 'are', 'be', 'your', 'you', 'with',
  'that', 'this', 'from', 'as', 'by', 'at', 'it', 'its', 'their', 'they', 'eu', 'uk', 'us', 'web',
  'app', 'apps', 'ui', 'size', 'target', 'must', 'not', 'has', 'have', 'per', 'level', 'new',
  'refund', 'return', 'policy',
])

function readJson(name: string): any {
  const p = path.join(DATA_DIR, name)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

let _index: FlatEntry[] | null = null

export function loadGovernanceIndex(): FlatEntry[] {
  if (_index) return _index
  const out: FlatEntry[] = []

  const eu = readJson('eu-consumer.json')
  for (const s of eu.obligations) {
    out.push({
      id: s.id,
      ref: s.ref,
      title: s.title,
      text: s.body,
      source: 'EU Consumer Rights Directive 2011/83/EU',
      scope: 'eu',
      verify: s.verify,
    })
  }

  const uk = readJson('uk-consumer.json')
  for (const s of uk.obligations) {
    out.push({
      id: s.id,
      ref: s.ref,
      title: s.title,
      text: s.body,
      source: 'UK Consumer Rights Act 2015 / CCR 2013',
      scope: 'uk',
      verify: s.verify,
    })
  }

  const us = readJson('us-consumer.json')
  for (const s of us.obligations) {
    out.push({
      id: s.id,
      ref: s.ref,
      title: s.title,
      text: s.body,
      source: 'US FTC / California ARL / Visa / Mastercard',
      scope: 'us',
      verify: s.verify,
    })
  }

  const fw = readJson('frameworks.json')
  for (const c of fw.obligations) {
    out.push({
      id: c.id,
      ref: c.ref,
      title: c.title,
      text: c.body,
      source: 'Framework crosswalk',
      scope: 'frameworks',
      verify: c.verify,
    })
  }

  // DATA FLYWHEEL — merge human-accepted contributed signals into the
  // retrievable index. Contributed entries always carry verify:true and are
  // never treated as vetted law (see data-flywheel.ts / guardrails G1–G5).
  for (const c of getAcceptedContributed()) {
    out.push({
      id: c.id,
      ref: c.ref,
      title: c.title,
      text: c.text,
      source: c.source,
      scope: c.scope,
      verify: c.verify,
    })
  }

  _index = out
  return out
}

/** Force the next retrieve to rebuild from disk (re-ingest newly accepted signals). */
export function invalidateGovernanceCache(): void {
  _index = null
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export interface RetrieveOpts {
  scope?: GovScope | 'all'
  topK?: number
  threshold?: number
}

export function retrieve(query: string, opts: RetrieveOpts = {}): GovEntry[] {
  const idx = loadGovernanceIndex()
  const scope = opts.scope || 'all'
  const topK = opts.topK || 6
  const qTokens = new Set(tokenize(query))
  const scopeFilter = scope === 'all' ? idx : idx.filter((e) => e.scope === scope)

  const scored = scopeFilter.map((e) => {
    const hay = tokenize(`${e.title} ${e.text} ${e.ref}`)
    let score = 0
    for (const t of hay) if (qTokens.has(t)) score += 1
    // ref-match boost (e.g. "2011/83", "cra2015", "ftc", "visa")
    for (const qt of qTokens) {
      if (e.ref.toLowerCase().includes(qt)) score += 2
    }
    return { e, score }
  })

  return scored
    .filter((s) => s.score > (opts.threshold ?? 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => ({ id: s.e.id, ref: s.e.ref, title: s.e.title, text: s.e.text, source: s.e.source, scope: s.e.scope, verify: s.e.verify }))
}

export const GOVERNANCE_SOURCES = [
  'EU Consumer Rights Directive 2011/83/EU (commission.europa.eu / eur-lex.europa.eu)',
  'UK Consumer Rights Act 2015 + Consumer Contracts Regulations 2013 (legislation.gov.uk)',
  'US FTC Cooling-Off Rule & truthful advertising (ftc.gov)',
  'California Automatic Renewal Law (oag.ca.gov)',
  'Visa / Mastercard refund & chargeback rules (visa.com / mastercard.com)',
]
