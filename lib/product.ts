export interface InputField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "ReturnCopy",
  slug: "returncopy",
  tagline: "A return policy that keeps the trust (and the sale).",
  description: "Generate a clear, on-brand return/refund policy plus empathetic customer-facing replies for the most common return reasons.",
  toolTitle: "Draft return policy & replies",
  resultLabel: "Policy + replies",
  ctaLabel: "Draft policy",
  features: [
  "Policy draft",
  "Empathetic reason replies",
  "Store-tone match",
  "Refund timeline"
],
  inputs: [
  {
    "key": "store_info",
    "label": "Store / category",
    "type": "input",
    "placeholder": "e.g. apparel boutique, 30-day window"
  },
  {
    "key": "tone",
    "label": "Tone",
    "type": "select",
    "options": [
      "Warm",
      "Neutral",
      "Playful"
    ]
  },
  {
    "key": "reason",
    "label": "Common return reason",
    "type": "input",
    "placeholder": "e.g. wrong size"
  }
] as InputField[],
  systemPrompt: "You are a customer-experience writer. Given store info, a tone, and a common return reason, draft a clear return/refund policy (with a refund timeline) and one empathetic customer-facing reply for that reason, matched to the tone. Be fair and human. In demo (mock) mode, return a realistic sample following exactly this structure.",
  pricing: [
  {
    "tier": "Free",
    "price": "$0",
    "desc": "5 drafts/mo"
  },
  {
    "tier": "Pro",
    "price": "$15/mo",
    "desc": "Unlimited, save history"
  }
],
  mock: (inputs: Record<string, string>): string => {
  const s = (inputs['store_info'] || '').trim()
  const t = inputs['tone'] || 'Warm'
  const r = (inputs['reason'] || '').trim()
  let out = 'RETURN POLICY (' + t + (s ? ', ' + s : '') + ')\n\n'
  out += 'Returns within 30 days, unworn with tags. Refund to original method within 5 business days of receipt.\n\n'
  out += 'REPLY (' + (r || 'wrong size') + '): Sorry it was not the right fit - we have made the exchange easy. Reply with your order # and we will send a prepaid label today.\n'
  out += '\n--- (Mock demo. Tell me your store for tailored policy.)'
  return out
}
}
