export interface InputField {
  key: string
  label: string
  type: 'input' | 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export const PRODUCT = {
  name: "ReturnCopy",
  slug: "returncopy",
  productId: "PROD_4XvEvrKUYuUfgBwDzSWk2q",
  priceMonthly: 15,
  yearlyProductId: "PROD_4pGH26BdWAbokQAUak2Ke6",
  priceYearly: 150,

  checkoutUrl: "https://pancake.waffo.ai/store/lixingliang-ai-tools-6cilbw8v/checkout/cs_2ff464d7-aa2f-5d2a-28f0-1f233b8843a1",
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
  definitionLead: "ReturnCopy drafts clear return and refund policy copy that keeps customer trust — policy text and customer-facing replies for merchants who need language that is firm without sounding hostile.",
  geoFaq: [
    { q: "What is ReturnCopy?", a: "ReturnCopy generates return/refund policy and reply drafts for e-commerce teams." },
    { q: "Who should use it?", a: "Merchants and CX leads writing or refreshing return policies." },
    { q: "Is it legal advice?", a: "No. It drafts communications; local consumer law and counsel still win." },
    { q: "What do I provide?", a: "Your store context, return window, and any special constraints." },
    { q: "Can it draft customer replies too?", a: "Yes. It can draft customer-facing return replies alongside policy text." },
    { q: "Does it guarantee compliance?", a: "No. Deterministic checks help catch risky phrasing; jurisdiction review stays with you." },
  ],
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
