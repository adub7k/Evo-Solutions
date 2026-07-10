// Blog content. Plain data, SSR'd — no CMS. New posts: add an entry here
// (newest first), push, done. Keep claims honest; local Albuquerque angle
// wherever it fits — that's what these rank for.

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  minutes: number;
  sections: { h?: string; ps: string[] }[];
};

export const posts: Post[] = [
  {
    slug: "what-tint-percentage-should-i-get",
    title: "What tint percentage should you actually get?",
    description:
      "35%, 20%, or limo? How to pick a tint shade you'll still love in three years — legality, visibility, heat, and looks, weighed honestly.",
    date: "2026-07-09",
    minutes: 5,
    sections: [
      {
        ps: [
          "The most common question in our shop isn't about price — it's \"how dark should I go?\" And the honest answer is that the darkest legal option isn't automatically the right one.",
          "In New Mexico you can run 20% VLT on every window except the windshield, which is darker than most states allow. But what's legal, what looks good, and what's pleasant to live with are three different questions.",
        ],
      },
      {
        h: "The shades, in practice",
        ps: [
          "50–70% is nearly invisible. You keep a factory look, lose glare, and with ceramic film still reject most of the heat. This is what we put on windshields (as a legal clear or light film) and what glare-sensitive drivers pick for front windows.",
          "35% is the sweet spot for most daily drivers — noticeably sleek from outside, but at night you can still see your mirrors and backup camera surroundings clearly. If you're torn, this is the safe pick.",
          "20% is New Mexico's legal limit and a real privacy shade. Beautiful on trucks and SUVs, especially rear glass. The tradeoff is night visibility — backing out of an unlit driveway takes more trust in your camera.",
          "5% (limo) belongs on rear windows of family haulers and work trucks where cargo privacy matters. We generally talk people out of 5% fronts — it's illegal in NM and genuinely unsafe at night.",
        ],
      },
      {
        h: "How heat rejection actually works",
        ps: [
          "Here's the part shops don't always explain: darkness and heat rejection are not the same thing. A cheap 5% dyed film blocks light but soaks heat. A quality 70% ceramic film looks nearly clear and outperforms it on infrared rejection. You pick darkness for looks and privacy; you pick film construction for heat.",
          "That's why our quotes separate the two questions. Shade is taste. Film tier is physics.",
        ],
      },
      {
        h: "Our advice after thousands of installs",
        ps: [
          "Front windows 35%, rear windows 20%, ceramic construction — that combination satisfies more Albuquerque drivers long-term than anything else we install. Come by the shop and we'll hold real film samples against your own glass before you decide.",
        ],
      },
    ],
  },
  {
    slug: "ceramic-vs-carbon-vs-dyed-tint",
    title: "Ceramic vs. carbon vs. dyed tint: what the price difference buys",
    description:
      "Why does the same shade of tint range from $150 to $500+? Film construction explained without the sales pitch — dyed, carbon, ceramic, and ceramic IR.",
    date: "2026-07-09",
    minutes: 6,
    sections: [
      {
        ps: [
          "Every tint quote you collect in Albuquerque will offer the same shades. The price spread — sometimes 3x for the \"same\" 35% — is entirely about what the film is made of. Here's what each tier actually is.",
        ],
      },
      {
        h: "Dyed film — the $150 special",
        ps: [
          "Dyed polyester blocks light with, literally, dye. It looks fine on day one. Then New Mexico sun goes to work: the dye breaks down, the film turns purple, bubbles, and peels — usually inside two or three years. Most \"cheap tint\" horror stories you've seen driving around are aging dyed film.",
          "We don't install it. Not because of margins — because we'd be redoing it under warranty by year three.",
        ],
      },
      {
        h: "Carbon — the honest value pick",
        ps: [
          "Carbon particles instead of dye means the color is stable for life — no purple, no fading. Solid heat rejection (roughly 60% of total solar energy), matte black appearance, lifetime warranty. This is our entry tier and a genuinely good product; if budget is the constraint, carbon is where value peaks.",
        ],
      },
      {
        h: "Ceramic — where most people land",
        ps: [
          "Nano-ceramic particles reject infrared heat specifically — the wavelength you feel on your arm at a red light. The jump from carbon to ceramic is the difference between \"cooler\" and \"noticeably, comment-about-it cooler.\" No signal interference with GPS, 5G, or toll tags, because there's no metal in it.",
          "Ceramic IR is the same idea with more ceramic layers — up to 96% infrared rejection. On a black car parked outside all day in an Albuquerque summer, you can feel the difference between ceramic and ceramic IR. On a white car garaged at night, honestly, you may not.",
        ],
      },
      {
        h: "The one-sentence version",
        ps: [
          "Never buy dyed. Buy carbon if budget rules. Buy ceramic if you want the heat gone. Buy ceramic IR if your car lives outside and you run black paint or leather. And any tier from a shop that computer-cuts and warranties for life beats a premium film installed badly.",
        ],
      },
    ],
  },
  {
    slug: "new-tint-care-first-30-days",
    title: "You just got tint. Here's the next 30 days.",
    description:
      "Windows up for how long? Why is there haze? Can you wash it? New-tint aftercare explained — what's normal, what's not, and when to call us.",
    date: "2026-07-09",
    minutes: 4,
    sections: [
      {
        ps: [
          "Fresh tint needs a little patience while the mounting solution cures out. Here's exactly what to expect, day by day, so nothing surprises you.",
        ],
      },
      {
        h: "The rules",
        ps: [
          "Keep windows up for 3–4 days in summer, up to a week in cooler months. Rolling them down early can shift film that hasn't bonded yet — it's the number one cause of edge peeling.",
          "Don't clean the inside of the glass for a week. After that, use an ammonia-free glass cleaner (ammonia attacks film adhesive) and a soft microfiber. Exterior washing is fine immediately — the film is inside.",
        ],
      },
      {
        h: "What's normal",
        ps: [
          "Haziness, a slightly milky look, or small water pockets in the first two weeks: completely normal. That's moisture between film and glass evaporating through the film. Sun exposure speeds it up. Don't press on the pockets — they leave on their own.",
          "What's NOT normal: bubbles with debris in them, gaps at edges, or scratches in the film. That's an install issue, and it's exactly what the warranty is for — one call and we make it right.",
        ],
      },
      {
        h: "Long-term care",
        ps: [
          "After the cure there's genuinely not much to do. Ammonia-free cleaner, soft cloth, and the film outlasts your ownership of the car. Our films carry a transferable lifetime warranty — keep your invoice; it adds value when you sell.",
        ],
      },
    ],
  },
  {
    slug: "how-to-wash-ceramic-coated-car",
    title: "How to wash a ceramic-coated car (and how to ruin one)",
    description:
      "A ceramic coating makes washing faster — if you wash it right. The two-bucket routine, what to never do, and how to bring back the slickness.",
    date: "2026-07-09",
    minutes: 5,
    sections: [
      {
        ps: [
          "The biggest myth about ceramic coatings is \"never wash your car again.\" The truth is better and less magical: washing becomes fast, safe, and weirdly satisfying — water sheets off, dirt releases, drying takes minutes. But the coating only keeps performing if it's maintained right.",
        ],
      },
      {
        h: "The routine that works",
        ps: [
          "Wash every 2–3 weeks with a pH-neutral car shampoo, two buckets (wash and rinse), and a clean microfiber mitt. Top down, panel by panel, rinse the mitt between panels. In Albuquerque's dust, a pre-rinse with open hose flow gets the grit off before anything touches paint.",
          "Dry with a plush microfiber towel or a blower. Water spots are a coated car's main enemy — our water is hard, and minerals baked on by sun etch into any surface, coated or not. Don't wash in direct afternoon sun; mornings are your friend.",
        ],
      },
      {
        h: "What ruins coatings",
        ps: [
          "Automatic brush washes. The spinning brushes carry the last hundred cars' grit and will mar any finish — they're the fastest way to make a coated car look uncoated. Touchless washes are fine when you're short on time.",
          "Household soaps (Dawn, dish liquid) strip the coating's top layer. High-pH degreasers, same. If a detailer who isn't us offers to \"polish it up,\" know that polishing physically removes coating — sometimes that's the right call, but it should be a decision, not an accident.",
        ],
      },
      {
        h: "Reviving the slickness",
        ps: [
          "After a year or two, water behavior gets lazier — that's the sacrificial top layer wearing, not the coating failing. A silica topper spray after a wash (or a maintenance visit with us) restores the sheeting in twenty minutes. Coatings we install come with wash guidance at pickup, and we're always a call away from a \"is this normal?\" answer.",
        ],
      },
    ],
  },
  {
    slug: "ppf-vs-ceramic-coating",
    title: "PPF vs. ceramic coating: which one does your car actually need?",
    description:
      "One stops rock chips, the other stops UV and water spots — they solve different problems. How to decide, and when stacking both makes sense.",
    date: "2026-07-09",
    minutes: 5,
    sections: [
      {
        ps: [
          "These two get cross-shopped constantly, and they shouldn't be — they protect against different things. The fastest way to decide is to name the damage you're most afraid of.",
        ],
      },
      {
        h: "PPF stops physical damage",
        ps: [
          "Paint protection film is a self-healing urethane layer thick enough to absorb impacts. Rock chips from I-25 gravel, sandblasting on the front bumper, scratches from brush or careless parking lots — PPF takes the hit and your paint never knows. Light scratches in the film literally disappear with heat.",
          "Its natural home is the front of the car: bumper, hood, fenders, mirrors. That's where 90% of impact damage lands on a daily driver.",
        ],
      },
      {
        h: "Ceramic coating stops chemical damage",
        ps: [
          "A coating is glass-hard chemistry bonded to your paint, microns thin. It won't stop a rock — but it blocks UV oxidation, makes bird droppings and water spots release instead of etching, and keeps gloss at a level that makes a three-year-old car read as new. And it makes every wash twice as fast.",
          "Its natural home is the whole car, because sun and water don't aim for the bumper.",
        ],
      },
      {
        h: "The decision, simplified",
        ps: [
          "Highway commuter, new car, dark paint: PPF the front. Outdoor parking, hard water, hate washing: coat the whole thing. New vehicle you plan to keep: front PPF plus full coating is the strongest stack there is — the film handles impacts, the coating handles the sun, and the coating goes over the film so everything sheds dirt the same way.",
          "Bring the car by and we'll quote the combinations flat, in writing, so you can decide with real numbers.",
        ],
      },
    ],
  },
];

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
