# Verify before launch — Evo Solutions

Everything in this list is either **a claim we removed because it wasn't
sourced**, or **an asset that would materially improve the site**. Nothing here
is currently published. Send an answer and it goes live; leave it and the site
stays honest without it.

The rule the site is built on: a claim only appears on the page if it can be
checked. Invented warranties, certifications, film brands, review counts and
heat-rejection percentages are an FTC problem for Angelo and a Google
structured-data penalty for the domain — not a copywriting shortcut.

---

## 1. Claims REMOVED from the live site

These were published on the previous version with no source behind them. All of
them are now held in `src/config/site.ts` under `unverified` and are not
rendered anywhere.

| Claim that was live                                                           | Why it was pulled                                                                                                                               | What we need                                                                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Lifetime, transferable manufacturer warranty" on every install               | **PARTLY RESOLVED 2026-08-26.** You confirmed a lifetime warranty on tint film; it is now published on `/tint` as "lifetime warranty on the film" covering bubbling, peeling, cracking and colour change. **Transferable** is still NOT claimed anywhere | The written warranty terms, so we can say whether it transfers to a new owner and what voids it |
| "10-year warranty against yellowing and cracking" on PPF                      | Same                                                                                                                                            | The PPF manufacturer's warranty document                                                                     |
| "Certified installers", "factory-trained"                                     | No certification seen                                                                                                                           | Which certifications, from whom, and are they current                                                        |
| "Climate-controlled, dust-free bay"                                           | Couldn't verify                                                                                                                                 | Is the install bay climate controlled?                                                                       |
| Film brands: **XPEL, 3M, SunTek, LLumar, Solar Gard, Rayno**                  | Your own shop photos show an **Impressive Films** retailer banner and a **HiTek** branded install post — none of the six listed                 | Which brands are you actually an authorised installer for? This is a real trust asset and worth putting back |
| "Reject up to **96%** of infrared heat", "88%", "62%", "blocks **99%** of UV" | Invented figures are gone. **You supplied real ones 2026-08-26** — carbon 99% UV / 20% heat, ceramic 99% UV / 65% heat — now in `site.tintSpecs` and published on `/tint` only | The HiTek / Impressive Films spec sheet, so these are backed by a document and not just memory. Re-check at each launch |
| Tint priced **$249 / $299 / $399 / $549**                                     | Contradicts your real ShopFlow prices (carbon $425, ceramic $560) by ~30% — it was underquoting you to anyone who read the page and then called | Nothing: the site is now quote-only by your decision. Flagged so you know it was there                       |
| "2–3 hours for a sedan", "same-day", "most vehicles complete same-day"        | Never sourced                                                                                                                                   | Realistic turnaround per service, if you want them published                                                 |
| "Thousands of installs" (in a blog post)                                      | Not verifiable                                                                                                                                  | A number you're comfortable standing behind, or leave it out                                                 |

## 2. Pricing — now live from ShopFlow ✅

**Prices are no longer written into the website at all.** The site reads
ShopFlow → Settings → Services, so whatever you charge is what the page shows,
and changing a price there updates the site with no deploy.

Currently published, straight from your settings:

- **Window tint** — Carbon $425 / $485 / $500, Ceramic $560 / $570 / $585, front-two $170 and $225, plus windshield, sunroof and moonroof add-ons
- **Detailing** — Interior $175 / $225 / $250, Full $325 / $395 / $450, plus pet hair removal
- **Ceramic coating** — from $1,100
- **PPF** — from $1,800, plus the large-vehicle tack pack
- The **$50 deposit** is shown as "secures your appointment and comes off the total"

Two things to check:

1. **Are these prices current?** They're now on the public site, so anything
   stale in ShopFlow is stale on the website too.
2. **Add-on naming matters.** Add-ons are matched to a service by name, so
   anything with "windshield", "sun roof", "moon roof" or "tint" in it shows on
   the tint page, and "pet hair"/"interior" on the detailing page. An add-on
   that matches nothing simply isn't displayed — deliberately, so it can't turn
   up under the wrong service.

### Commercial pricing — optional, currently off

The commercial quote form can show an instant **ballpark** once it knows your
per-square-foot rate. To switch it on, add a service in ShopFlow named something
like **"Commercial Window Film — per sq ft"** with the rate as its price (e.g.
`9` for $9/sq ft, no size pricing). The estimator picks it up automatically and
shows a deliberately wide band, clearly labelled as a ballpark, with the site
visit still producing the fixed number.

Until you add that, the form collects everything and shows no estimate — which
is the right behaviour. We are not going to guess a rate.

## 3. Google Business Profile — please confirm

- **Rating and review count.** The site publishes **5.0 across 18 reviews**, read
  off the profile on **2026-07-08**. That number is also emitted as
  `aggregateRating` structured data, so it has to match what Google sees. If the
  count has moved, update `site.reviews` in `src/config/site.ts`.
- **The three reviews on the site** (Eric Luchetti, J D, Debi Smith) are quoted
  from the profile. If you want different ones featured, send screenshots and
  we'll swap them — but only reviews that are genuinely on the profile.
- **Direct profile link.** We're currently linking to a Google _search_ for the
  business because we don't have the Place ID. Send the "write a review" short
  link (or the Maps URL) and the Reviews page will point straight at it.
- **Hours.** Site says Mon–Sat 10:00 AM – 6:00 PM, Sunday closed. Confirm this
  matches the profile exactly — mismatches hurt local ranking.

## 4. Photography

Everything on the site is your own photography. There is no stock imagery
anywhere, and none should be added.

Two things worth fixing when you get a chance:

- **Three commercial/home photos are phone screenshots** with black bars top and
  bottom (the home at dusk, the restaurant patio, the interior glass wall). The
  site crops the bars out automatically, but re-uploading the original photos
  instead of the screenshots would give us the full frame.
- **The homepage hero photo in ShopFlow is square** (1080×1080) with a white
  gradient baked into the top — it looks like it was made as a social post. The
  homepage hero is a wide banner, so a square image gets badly cropped and the
  white washes out the header. **The site therefore ignores it and uses the
  Porsche 911 shot from your gallery instead.** Upload a _landscape_ photo to
  Settings → Website Photos → Hero and it will take over automatically.
- **Higher-resolution originals** would help. The widest photo we have is
  1280px, which is a little soft as a full-width hero on a large monitor.

### True before/after pairs

The brief asked for before/after sections. We don't have genuine pairs, and
staging one from two unrelated cars is exactly what this site is trying not to
do. Instead the homepage and detailing page show a **real progression** — the
same blue Camry with film going on, and the same car finished.

To get proper before/afters, shoot the same angle twice on the next few jobs:
dirty interior → cleaned, swirled paint → corrected, chipped bumper → filmed,
untinted glass → tinted. Upload both and caption them "Before — …" / "After — …".

### Gallery captions

We wrote captions and filed each photo under a service based on what's visible.
If we've filed one wrong, just type a caption in ShopFlow → Work Gallery — your
caption always wins over ours, and words like "PPF", "tint", "coating" or
"detail" in it re-file the photo under the right filter automatically.

## 5. Team bios

Angelo Almanzar (Owner), Sergio Martinez (Co-Owner / PPF technician) and Ruben
Gonzalez (Technician) are on the About page with their photos and titles,
straight from ShopFlow. **All three bios are empty**, so the page shows name and
title only. Two or three sentences each — how long they've been doing it, what
they specialise in — would make that page significantly stronger. Add them in
ShopFlow → Settings → Meet the Team and they appear without a deploy.

## 6. Business facts to confirm

- **Service area.** The site says vehicle work happens at the shop, and
  commercial/home glass is installed on site across Albuquerque plus **Rio
  Rancho, Corrales, Bernalillo and Los Lunas**. Confirm you actually cover those
  four — we deliberately did not invent a longer list.
- **Years in business / founding date.** Not published anywhere because we don't
  have it. "Serving Albuquerque since 20XX" is a strong trust signal if you have
  a date.
- **Social links.** Instagram / Facebook are configured but empty, so no social
  icons render. Send the handles and they'll appear in the footer.
- **Financing.** The old site said "financing available". Removed — do you offer
  it, and through whom?
- **Film brands — confirmed ✅.** You use **HiTek** and **Impressive Films**;
  both are now named on the window tint and PPF pages. We state that you install
  them, not that you're an authorised or exclusive dealer — send the dealer
  paperwork if you have it and we can say more.

## 7. Tracking

- **Google Analytics 4** (`G-0KB9XP0PFV`) — live.
- **Google Ads** (`AW-17888381819`) — live, conversion fires on quote submit.
- **Meta Pixel — NOT configured, but now one variable away.** Set
  `VITE_META_PIXEL_ID` in Railway to the pixel ID of the ad account that will
  run the traffic and redeploy. The pixel then loads on every page and fires
  PageView, ViewContent (on `/tint`), InitiateCheckout and Lead with no code
  change. Required before you run Meta ads.
- **`/tint` — the paid-social landing page.** Point Meta ads at
  `https://www.evosolution.org/tint`. It's `noindex` on purpose so it can't
  compete with `/window-tint` in search. Leads post to the same ShopFlow
  endpoint as every other form; if Meta strips your UTMs, the `fbclid` on the
  URL is enough for the lead to land in ShopFlow tagged `facebook` /
  `paid-social`, with the raw click ID in the lead notes.
- **Google Search Console** — verify the domain and submit
  `https://www.evosolution.org/sitemap.xml` after this deploys.

## 8. Deployment note

`VITE_SHOPFLOW_API_URL` and `VITE_SHOPFLOW_SHOP_SLUG` must be set in the Railway
environment (`https://shopflowio.up.railway.app` / `mad-detailing`). They're not
committed. If they're missing the code falls back to those same values, so the
site still works — but set them explicitly so it's not relying on a default.

## 9. Logo

The header and footer use an alpha-keyed copy of your shield
(`public/img/evo-solutions-logo-*.png`). We don't use the ShopFlow logo upload
there because it's a JPEG of the badge on a solid black card, which renders as a
black box against the dark page. If you change your logo, send it as a PNG with
a transparent background and we'll swap the bundled files.

The circular text around the badge is unreadable at header size. A horizontal
lockup (shield + "EVO SOLUTIONS" on one line) would look sharper if you ever
have one made.
