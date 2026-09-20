import type { KbEntry } from "../support-kit/types";
export type { KbEntry };

export const KB: KbEntry[] = [
  {
    id: "what",
    title: "What ReturnCopy does",
    keywords: ["ReturnCopy", "returncopy", "what", "product", "about", "A return policy that keeps the trust (and the sale)."],
    body: "A return policy that keeps the trust (and the sale).. ReturnCopy drafts clear return and refund policy copy that keeps customer trust — policy text and customer-facing replies for merchants who need language that is firm without sounding hostile.",
    source: "ReturnCopy product definition",
    tags: [],
  },
  {
    id: "features",
    title: "ReturnCopy features",
    keywords: ["features", "feature", "can", "does", "Policy draft", "Empathetic reason replies", "Store-tone match", "Refund timeline"],
    body: "ReturnCopy includes: Policy draft; Empathetic reason replies; Store-tone match; Refund timeline. It does not add capabilities that are not listed here.",
    source: "ReturnCopy feature list",
    tags: [],
  },
  {
    id: "pricing",
    title: "ReturnCopy pricing",
    keywords: ["price", "pricing", "plan", "cost", "billing", "subscription", "monthly", "yearly"],
    body: "Listed prices for ReturnCopy: $15/month and $150/year. Checkout uses the in-app checkout route. This assistant cannot change a subscription or issue a refund.",
    source: "ReturnCopy pricing fields",
    tags: [],
  },
  {
    id: "howto",
    title: "How to use ReturnCopy",
    keywords: ["how", "start", "use", "tool", "run", "Draft return policy & replies"],
    body: "Open ReturnCopy and use Draft return policy & replies. The form asks for: Store / category; Tone; Common return reason.",
    source: "ReturnCopy tool fields",
    tags: [],
  },
  {
    id: "faq-1",
    title: "What is ReturnCopy?",
    keywords: ["What", "is", "ReturnCopy?"],
    body: "ReturnCopy generates return/refund policy and reply drafts for e-commerce teams.",
    source: "ReturnCopy FAQ",
    tags: [],
  },
  {
    id: "faq-2",
    title: "Who should use it?",
    keywords: ["Who", "should", "use", "it?"],
    body: "Merchants and CX leads writing or refreshing return policies.",
    source: "ReturnCopy FAQ",
    tags: [],
  },
  {
    id: "faq-3",
    title: "Is it legal advice?",
    keywords: ["Is", "it", "legal", "advice?"],
    body: "No. It drafts communications; local consumer law and counsel still win.",
    source: "ReturnCopy FAQ",
    tags: [],
  },
  {
    id: "honesty",
    title: "What this assistant will not claim",
    keywords: ["legal", "advice", "guarantee", "demo", "human", "refund", "support"],
    body: "Answers about ReturnCopy are decision support only, not legal, tax, accessibility-certification, or compliance sign-off. This assistant does not invent integrations, SSO, CSV export, or Slack connections unless they are already in the product description. If live AI is unavailable, the product must not pretend a demo result is live. Say you want a human and leave an email if you need a person.",
    source: "ReturnCopy support policy",
    tags: ["compliance"],
  },
];

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}
function toWords(s: string): string[] {
  return normalize(s).split(/\s+/).map((w) => w.trim()).filter(Boolean);
}
function cjkBigrams(s: string): string[] {
  const grams: string[] = [];
  const han = /[\u4e00-\u9fff]/;
  for (const w of toWords(s)) {
    if (han.test(w) && w.length >= 2) {
      for (let i = 0; i < w.length - 1; i++) grams.push(w.slice(i, i + 2));
    }
  }
  return grams;
}
function scoreEntry(entry: KbEntry, query: string): number {
  const q = normalize(query);
  const qWords = new Set(toWords(q));
  const qGrams = new Set(cjkBigrams(q));
  let s = 0;
  for (const kw of entry.keywords) {
    const k = kw.toLowerCase();
    if (q.includes(k)) s += 3;
  }
  for (const tw of toWords(entry.title)) {
    if (qWords.has(tw)) s += 2;
  }
  const idx = normalize(entry.keywords.join(" ") + " " + entry.title + " " + entry.body.slice(0, 400));
  for (const g of qGrams) if (idx.includes(g)) s += 0.5;
  return s;
}

export interface RetrieveResult {
  entries: KbEntry[];
  topScore: number;
}

export function retrieve(query: string, topK = 4, entries: KbEntry[] = KB): RetrieveResult {
  const scored = entries
    .map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  return { entries: scored.map((x) => x.e), topScore: scored.length ? scored[0].s : 0 };
}

export function isComplianceRelated(entries: KbEntry[]): boolean {
  return entries.some((e) => e.tags.includes("compliance"));
}
