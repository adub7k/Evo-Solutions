# /ppf — the paid-search (RSA) landing page

`https://www.evosolution.org/ppf` is the Google Ads destination for paint
protection film. It is the PPF twin of `/tint`: no nav, no footer links,
`noindex`, one form (rendered twice), a phone number in the header, and a
sticky call bar on mobile. `/paint-protection-film` stays the SEO page — do
not point ads at it, and do not link the two together.

## Final URLs

| Ad group (intent)                                                         | Final URL                                                  | What the visitor lands on                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Generic — "paint protection film albuquerque", "ppf near me", "clear bra" | `https://www.evosolution.org/ppf?src=google`               | Hero + form                                                        |
| Coverage — "full front ppf", "hood and bumper ppf"                        | `https://www.evosolution.org/ppf?src=google#full-front`    | Jumps to the coverage cards, form preselects **Full front**        |
| Budget — "partial front ppf", "bumper ppf"                                | `https://www.evosolution.org/ppf?src=google#partial-front` | Same, preselects **Partial front**                                 |
| Full body — "full body ppf", "full car wrap ppf"                          | `https://www.evosolution.org/ppf?src=google#full-body`     | Same, preselects **Full body** (quoted per car, no estimate shown) |
| Cost — "ppf cost", "how much is ppf"                                      | `https://www.evosolution.org/ppf?src=google#coverage`      | Jumps straight to the live price line + coverage cards             |

`?src=google` selects the Google display number once the Twilio tracking
numbers exist (`src/lib/channel.ts`, currently null → falls back to the real
number). The `gclid` Google appends is captured on landing, so the lead is
tagged `google / cpc` in ShopFlow even if the campaign ships without UTMs.

## RSA copy that message-matches the page

Every line below is a claim the page itself makes. Nothing here should be
added to the ad that the page can't back — an ad that promises a warranty or a
turnaround time the page doesn't mention is a Quality Score problem _and_ an
FTC one.

### Headlines (max 30)

| Headline                       | chars |
| ------------------------------ | ----- |
| Paint Protection Film ABQ      | 25    |
| PPF Installed In Albuquerque   | 28    |
| Clear Bra For Your Car         | 22    |
| Stop Rock Chips For Good       | 24    |
| Self-Healing Urethane Film     | 26    |
| Rated 5.0 On Google            | 19    |
| Flat Price By Text, No Deposit | 30    |
| Cut To Your Exact Model        | 23    |
| Installed In Our Own Bay       | 24    |
| Partial Or Full Front PPF      | 25    |
| Full Front PPF – No Hood Line  | 29    |
| HiTek & Impressive Films       | 24    |
| Walk-Ins Welcome Mon–Sat       | 24    |
| Keep Factory Paint Underneath  | 29    |
| Front Coverage From $1,800     | 26    |

Pin **"Paint Protection Film ABQ"** or **"PPF Installed In Albuquerque"** to
position 1 for the generic group; pin **"Full Front PPF – No Hood Line"** to
position 1 for the full-front group. Leave the rest unpinned.

### Descriptions (max 90)

| Description                                                                                | chars |
| ------------------------------------------------------------------------------------------ | ----- |
| Self-healing film cut to your model, installed in our Albuquerque bay. Flat price by text. | 90    |
| Rock chips stop at the film, not your paint. Partial front, full front or full body.       | 84    |
| Tell us what you drive. We text back the right coverage and a flat price. No deposit.      | 85    |
| 5.0 on Google. HiTek & Impressive Films, installed on Vista Alameda NE. Walk-ins welcome.  | 89    |

## Negatives to start with

`diy`, `kit`, `roll`, `per foot`, `jobs`, `training`, `course`, `how to
install`, `xpel`, `3m`, `suntek`, `llumar`, `stek`. The brand names are
negatives because the shop installs **HiTek and Impressive Films**; a visitor
searching for a specific other brand bounces.

## Conversions

- **Primary:** the existing Google Ads conversion "EVO Quote Form Submit"
  fires on form submit (`trackQuoteAdsConversion`), with `coverage`,
  `vehicle_year/make/model` on the GA4 `generate_lead` event.
- **Secondary (worth importing from GA4):** `phone_click` — on mobile search
  traffic a call is the higher-intent action, and the header number, hero
  button, sticky bar and close all fire it with a `location`.
- `landing_view` fires on arrival with `service: "PPF"` so the two landing
  pages can be split in GA4.

## What's still dark on the page (needs Angelo)

1. **Warranty.** `site.ppfSpecs.warranty` is `null`. The guarantee section and
   the "included" warranty line render only once it's set to the
   manufacturer's wording. Until then the page says nothing about a warranty.
2. **Prices are OFF site-wide** (`site.publishPrices = false`, owner decision
   2026-09-16). The page's price line, the coverage price range and the
   success-screen estimate are all wired and render the moment the flag is
   flipped back. Do not run a price in the ad while the page shows none.
3. **PPF photos.** Three gallery photos are tagged `ppf`; more installs (and a
   real chipped-bumper → filmed before/after) would strengthen the proof row.
