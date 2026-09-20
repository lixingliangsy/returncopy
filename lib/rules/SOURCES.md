# ReturnCopy — Authoritative Sources (deep-data moat)

Web-researched, primary authoritative references backing the curated
consumer-protection dataset (`returncopy-agent/lib/governance-data/*.json`).
All entries carry `verify: true` (re-check against primary law each cycle — an
expired date or amended statute is a bug).

## EU
- EU Consumer Rights Directive 2011/83/EU (right of withdrawal, refund timeline, no restocking fee, exceptions)
  - https://commission.europa.eu/law/law-topic/consumer-protection-law/consumer-contract-law/consumer-rights-directive_en
  - https://eur-lex.europa.eu/eli/dir/2011/83/oj

## UK
- Consumer Rights Act 2015 (30-day short-term right to reject, repair/replacement, services)
  - https://www.legislation.gov.uk/ukpga/2015/15/contents
  - https://www.legislation.gov.uk/ukpga/2015/15/section/22/2015-09-01
- Consumer Contracts Regulations 2013 (14-day cancellation for distance/online sales)
  - https://www.legislation.gov.uk/uksi/2013/3137/contents

## US (federal + state)
- FTC Cooling-Off Rule (3 business days to cancel door-to-door / temporary-location sales)
  - https://consumer.ftc.gov/buyers-remorse-ftcs-cooling-rule-may-help
- FTC truthful advertising (no false refund/approval promises)
  - https://www.ftc.gov/business-guidance/advertising-marketing/truthful-advertising
- California Automatic Renewal Law (ARL, amended eff. 1 July 2025)
  - https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-consumer-alert-california%E2%80%99s-automatic-renewal-law

## Card schemes (refund & chargeback)
- Visa — Processing Refunds to Cardholders (refund to original account; US 5-day deposit)
  - https://usa.visa.com/dam/VCOM/global/support-legal/documents/processing-refunds-vrm-2016-04-21.pdf
- Mastercard — Chargeback Guide, Merchant Edition (merchants cannot waive chargeback rights)
  - https://www.mastercard.com/content/dam/public/mastercardcom/na/global-site/documents/chargeback-guide.pdf

## Crosswalk
- EU ↔ UK retained-rights alignment; card-scheme chargeback ≠ statutory refund right;
  US federal floor + state supplements (e.g. California ARL). See `frameworks.json`.
