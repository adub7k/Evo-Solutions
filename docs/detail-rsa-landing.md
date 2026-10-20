# /detail — the paid-search (RSA) landing page for auto detailing

`https://www.evosolution.org/detail` is the Google Ads destination for
detailing. It is the detailing twin of `/ppf` and `/ceramic` — no nav, no
footer links, `noindex`, a phone number in the header, a sticky bar on mobile —
with one difference: **it shows prices and books the job.** Detailing is sold
as three packages priced by vehicle size (Silver / Gold / Platinum), so the
page lists them straight from ShopFlow and the visitor books package → size →
time → $50 deposit without talking to anyone. The "ask first" form at the
bottom catches whoever isn't ready to pick. `/auto-detailing` stays the SEO
page — do not point ads at it, and do not link the two together.

## Where the numbers come from

Nothing on the page is typed into the site. ShopFlow → Settings → Services
(tenant `mad-detailing`) drives all of it:

| On the page                      | ShopFlow field                                                      |
| -------------------------------- | ------------------------------------------------------------------- |
| Package names and order          | services with category **Detail**, cheapest first                   |
| Price per vehicle size           | each service's _Price by vehicle size_ (Sedan / Mid-size SUV / Large SUV & Truck) |
| "about 2.5–4.5 hrs"              | each service's per-size **minutes** (and the calendar blocks that long) |
| What's included (the checklist)  | the service **description** — one item per `·` or line               |
| "Add to any package" + extras    | add-ons (matched by name — see `ADDON_MATCHERS` in `src/lib/pricing.ts`) |
| "$50 deposit"                    | Settings → Deposit (Square)                                          |
| "Most popular"                   | the middle package of three — not a setting                          |

Changing a price, a duration or an included item in ShopFlow updates the page
with no deploy. Leaving a description blank just hides that package's
checklist; the page's own "how we work" section still renders.

## Final URLs

| Ad group (intent)                                                     | Final URL                                                   | What the visitor lands on                                     |
| --------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Generic — "car detailing albuquerque", "auto detailing near me"       | `https://www.evosolution.org/detail?src=google`          | Hero → packages → booking                                     |
| Price — "car detailing prices", "how much is a full detail"           | `https://www.evosolution.org/detail?src=google#packages` | Jumps straight to the three priced packages                   |
| Interior — "interior car detailing", "car interior cleaning"          | `https://www.evosolution.org/detail?src=google#silver`   | Booking form preselects **Silver Detail**                      |
| Full detail — "full car detail", "interior and exterior detailing"    | `https://www.evosolution.org/detail?src=google#gold`     | Booking form preselects **Gold Detail**                        |
| Coating — "ceramic coating and detail", "paint protection detail"     | `https://www.evosolution.org/detail?src=google#platinum` | Booking form preselects **Platinum Detail**                    |
| Ready to book — "book car detailing online"                           | `https://www.evosolution.org/detail?src=google#book`     | Jumps to the booking form                                     |

The `#silver` / `#gold` / `#platinum` anchors match the start of the package
name as it is in ShopFlow (lower-cased, spaces to dashes) — rename a package
there and update the anchor here.

`?src=google` selects the Google display number once the Twilio tracking
numbers exist (`src/lib/channel.ts`, currently null → falls back to the real
number). The `gclid` Google appends is captured on landing and stored on both
the lead and the booking in ShopFlow, so a job booked straight from the ad is
tagged `google / cpc` even if the campaign ships without UTMs.

## Conversions

Three events fire on this page, all through the existing gtag setup
(`AW-17888381819` + GA4 `G-0KB9XP0PFV`):

| Event                | When                                                           | Where it fires                     |
| -------------------- | -------------------------------------------------------------- | ---------------------------------- |
| `begin_checkout`     | the visitor leaves for the Square deposit checkout             | `BookingForm` (value = deposit)    |
| **`booking_confirmed`** | the deposit was paid and ShopFlow confirmed the appointment | `/book/confirmed` (value = job total) |
| `generate_lead` + the Ads quote conversion | the "ask first" form captured name + phone | `LandingLeadForm`                  |

**To do in Google Ads:** import the GA4 `booking_confirmed` event as a
conversion (or create an Ads conversion and give its label to
`trackBookingConfirmed` in `src/lib/analytics.ts`) and make it the primary
conversion for this campaign. A paid deposit is a far stronger signal than a
form fill — let the bidding optimise toward it.

## RSA copy that message-matches the page

Every line below is a claim the page itself makes. Prices appear here because
this page shows them; keep them off ads that land anywhere else on the site.

### Headlines (max 30)

| Headline                         | chars |
| -------------------------------- | ----- |
| Auto Detailing Albuquerque       | 26    |
| Car Detailing Priced Up Front    | 29    |
| Book Your Detail Online          | 23    |
| Silver, Gold & Platinum Details  | 30    |
| Rated 5.0 On Google              | 19    |
| Priced By Vehicle Size           | 22    |
| Interior Steam Clean & Extract   | 30    |
| Clay Bar, Iron & Sealant         | 24    |
| Ceramic Coating Package          | 23    |
| Hold Your Spot With A Deposit    | 29    |
| Pay The Rest At Pickup           | 22    |
| Same Crew As MAD Detailing NM    | 29    |
| Walk-Ins Welcome Mon–Sat         | 24    |
| Trucks & SUVs Welcome            | 21    |
| Details From $229                | 17    |

### Descriptions (max 90)

| Description                                                                                  | chars |
| -------------------------------------------------------------------------------------------- | ----- |
| Three detail packages priced by vehicle size. Pick a time, hold it with a deposit, done.     | 88    |
| Interior steam clean, carpet extraction, clay bar & sealant. Book online in two minutes.     | 87    |
| The Albuquerque shop that built its 5.0 Google rating on detailing. Prices on the page.      | 86    |
| Sedan, SUV or truck — see your exact price, book a time that fits the whole job.             | 82    |

### Sitelinks

| Link text        | Final URL                                | Description lines                               |
| ---------------- | ---------------------------------------- | ----------------------------------------------- |
| See Prices       | `/detail?src=google#packages`         | Silver, Gold & Platinum / Priced by vehicle size |
| Book Online      | `/detail?src=google#book`             | Pick a time / $50 deposit holds it              |
| Ask First        | `/detail?src=google#quote-close`      | Text us the car / We'll text the package back   |
| Ceramic Coating  | `/ceramic?src=google`                    | Paint corrected first / Nasiol coating          |

### Negative keywords to start with

`mobile`, `at home`, `near me free`, `jobs`, `hiring`, `supplies`, `products`,
`course`, `training`, `diy`, `kit`, `rv`, `boat` (we don't do mobile or
marine; the page says bring it to Vista Alameda).
