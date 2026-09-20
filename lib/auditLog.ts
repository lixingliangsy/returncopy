import fs from 'fs'
import path from 'path'

export function audit(event: string, meta: Record<string, unknown> = {}) {
  try {
    const dir = path.join(process.cwd(), '.data', 'audit')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const line = { ts: new Date().toISOString(), event, ...meta }
    fs.appendFileSync(path.join(dir, 'audit.jsonl'), JSON.stringify(line) + '\n', 'utf8')
  } catch {
    /* serverless best-effort */
  }
}

/** Compatible with both audit(event, meta) and appendAudit(slug, row) call sites. */
export function appendAudit(slugOrEvent: string, row: Record<string, unknown> = {}): void {
  try {
    const dir = path.join(process.cwd(), '.data', 'audit')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const line = { ts: new Date().toISOString(), slug: slugOrEvent, event: slugOrEvent, ...row }
    const file = row && Object.keys(row).length ? `${slugOrEvent}.jsonl` : 'audit.jsonl'
    fs.appendFileSync(path.join(dir, file), JSON.stringify(line) + '\n', 'utf8')
  } catch {
    /* ignore */
  }
}

export async function writeAudit(row: Record<string, unknown> | string, meta?: Record<string, unknown>): Promise<void> {
  if (typeof row === 'string') {
    appendAudit(row, meta || {})
    return
  }
  const slug = String((row as any).slug || 'product')
  appendAudit(slug, row)
}
