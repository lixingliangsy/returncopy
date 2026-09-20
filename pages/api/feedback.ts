// pages/api/feedback.ts — L2: save correction / thumbs / asset on a run (project library).
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { PRODUCT } from '../../lib/product'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const slug = PRODUCT.slug
  const { runId, kind, text, rating, asset } = (req.body || {}) as {
    runId?: string
    kind?: 'correction' | 'thumbs' | 'asset'
    text?: string
    rating?: number
    asset?: any
  }
  if (!runId) return res.status(400).json({ ok: false, error: 'runId is required' })
  const dir = path.join(process.cwd(), '.data', 'feedback')
  const file = path.join(dir, `${slug}.jsonl`)
  const row = {
    id: crypto.randomUUID(),
    slug,
    runId,
    kind: kind || 'thumbs',
    text: text || '',
    rating: typeof rating === 'number' ? rating : null,
    asset: asset || null,
    ts: new Date().toISOString(),
  }
  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.appendFileSync(file, JSON.stringify(row) + '\n')
    return res.status(200).json({ ok: true, id: row.id, saved: true })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'write failed' })
  }
}
