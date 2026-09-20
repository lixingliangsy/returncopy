// scan.mjs — returncopy 电商退货政策文案合规审计（真实实现，T1 审计模板契约驱动）
// 领域：Consumer Law / 退货权（EU 14 天无理由、退款时效、信息披露）。审计退货文案合规。
// 幂等：同输入同输出、无副作用、可重入。返回 { items:[{id,...}], metrics:{...} }
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA = path.join(ROOT, '.data')
const AUDIT = path.join(DATA, 'audit')

async function fetchText(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12000)
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': 't1-audit-bot/1.0 (+https://lxsai.com)' } })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.text()
  } finally { clearTimeout(t) }
}

async function loadTargets(targets) {
  const docs = []
  for (const t of targets) {
    try {
      if (/^https?:\/\//i.test(t)) { docs.push(await fetchText(t)); continue }
        const p = path.isAbsolute(t) ? t : path.join(AUDIT, t)
      docs.push(fs.readFileSync(p, 'utf8'))
    } catch (e) { console.warn('[scan] target load failed:', t, e.message) }
  }
  return docs
}

export async function scan(ctx) {
  const cfg = JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'))
  const targets = (cfg.scan && cfg.scan.targets) || [path.join(AUDIT, 'returncopy-sample.json')]
  const docs = await loadTargets(targets)
  let cfgObj = {}
  try { cfgObj = JSON.parse(docs.join('\n')) } catch (e) { console.warn('[scan] parse failed', e.message) }
  const items = []

  const window = Number(cfgObj.return_window_days)
  const windowBad = !Number.isFinite(window) || window < 14
  if (windowBad) {
    items.push({
      id: 'returncopy:return-window-short',
      category: 'consumer',
      severity: 'medium',
      title: 'Return window too short / missing',
      detail: Number.isFinite(window) ? `退货窗口仅 ${window} 天（EU 通常要求 ≥14 天）` : '未声明退货窗口',
      present: false
    })
  }
  const refund = Number(cfgObj.refund_timeline_days)
  const refundBad = !Number.isFinite(refund) || refund <= 0
  if (refundBad) {
    items.push({
      id: 'returncopy:refund-timeline-missing',
      category: 'consumer',
      severity: 'medium',
      title: 'No refund timeline',
      detail: Number.isFinite(refund) ? `退款时效 ${refund} 天不合理` : '未声明退款到账时效',
      present: false
    })
  }

  const checks = [
    ['restocking_fee_disclosed', 'returncopy:restocking-fee-missing', 'disclosure', 'medium', 'Restocking fee not disclosed', '未披露重新上架费/手续费'],
    ['right_of_withdrawal_stated', 'returncopy:withdrawal-missing', 'legal', 'medium', 'No right-of-withdrawal stated', '未明示消费者撤回权（EU 法定）'],
    ['legal_compliance', 'returncopy:legal-compliance-missing', 'legal', 'high', 'No legal-compliance check', '退货政策未对照适用法律校验'],
    ['exclusions_clear', 'returncopy:exclusions-missing', 'disclosure', 'low', 'Exclusions not clear', '不退/特例范围表述不清']
  ]
  const present = {}
  for (const [key, id, category, severity, title, detail] of checks) {
    const ok = cfgObj[key] === true
    present[key] = ok
    if (!ok) items.push({ id, category, severity, title, detail, present: false })
  }
  present.return_window_ok = !windowBad
  present.refund_timeline_ok = !refundBad

  const weights = { high: 18, medium: 10, low: 5 }
  const bySeverity = { high: 0, medium: 0, low: 0 }
  let penalty = 0
  for (const it of items) { penalty += weights[it.severity] || 0; bySeverity[it.severity]++ }
  const score = Math.max(0, 100 - penalty)

  const metrics = {
    return_policy_score: score,
    return_window_days: Number.isFinite(window) ? window : null,
    refund_timeline_days: Number.isFinite(refund) ? refund : null,
    total_checks: checks.length + 2,
    passed: (checks.length + 2) - items.length,
    by_severity: bySeverity,
    ...present
  }
  return { items, metrics }
}
