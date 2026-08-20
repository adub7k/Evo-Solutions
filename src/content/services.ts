/**
 * Per-service page content.
 *
 * Each service gets its OWN page structure — the route files compose these
 * blocks in a different order per service, because a tint buyer and a PPF
 * buyer are not the same person and shouldn't be sold the same way.
 *
 * Copy rules: no warranty claims, no certification claims, no film-brand
 * claims, no heat-rejection percentages, no prices. See src/config/site.ts.
 */

export type GalleryTag = "tint" | "ceramic" | "ppf" | "detail" | "commercial";

/** Literal route paths, so <Link to={service.route}> stays type-safe. */
export type ServiceRoute =
  | "/window-tint"
  | "/ceramic-coating"
  | "/paint-protection-film"
  | "/auto-detailing"
  | "/commercial-window-tint";

export type CommercialLead = {
  blurb: string;
  selectLabel: string;
  selectOptions: string[];
  goalOptions: string[];
};

export type ServiceContent = {
  slug: string;
  /** Same as `/${slug}` but typed as a literal for the router. */
  route: ServiceRoute;
  key: GalleryTag;
  /** Must match a lead-form option in ShopFlow so the CRM tags it correctly. */
  leadValue: string;
  serviceName: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  /** Sub-headline under the H1. One or two sentences, no wall of text. */
  sub: string;
  /** Owner-photo slot (ShopFlow → Settings → Website Photos). */
  imageSlot: string;
  /** Short outcome line used on the homepage service grid. */
  cardBlurb: string;
  cardBenefits: string[];
  /** The "why you actually care" section. */
  problem: { title: string; body: string; costs: { label: string; body: string }[] };
  benefits: { title: string; body: string }[];
  /** Optional: film/coverage tiers. No prices — quote-only site. */
  options?: {
    title: string;
    intro: string;
    items: { name: string; tag: string; body: string; bestFor: string }[];
  };
  /** Honest expectation setting. Strongest trust device on the page. */
  truths?: { does: string[]; doesNot: string[] };
  included: string[];
  process: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  quote: { heading: string; sub: string };
  /** Service-specific options for step 3 of the quote form. */
  goalOptions: string[];
  related: string[];
  variant?: "auto" | "commercial";
  lead?: CommercialLead;
};

export const services: ServiceContent[] = [
  /* ===================================================== WINDOW TINT ==== */
  {
    slug: "window-tint",
    route: "/window-tint",
    key: "tint",
    leadValue: "Window tint",
    serviceName: "Window Tint",
    navLabel: "Window Tint",
    metaTitle: "Window Tint in Albuquerque, NM | Ceramic & Carbon Film — Evo Solutions",
    metaDescription:
      "Ceramic and carbon window tint installed in Albuquerque. Cooler cabin, less glare, real privacy, and a legal shade for New Mexico. Free quote, no pressure.",
    eyebrow: "Window Tint · Albuquerque",
    headline: "Window tint built for Albuquerque sun.",
    sub: "Albuquerque sits at 5,300 feet. Thinner air means the sun comes through harder here than it does at sea level — and a car parked outside in June turns into an oven. Film is the fix, and the install is what makes it last.",
    imageSlot: "service_tint",
    cardBlurb:
      "Ceramic and carbon film that cuts the heat, kills the glare, and gives the glass a clean factory look.",
    cardBenefits: ["Cooler cabin", "Glare control", "Real privacy", "Legal NM shade"],
    problem: {
      title: "What the sun here actually costs you",
      body: "This isn't a comfort upgrade you talk yourself into. Left alone, high-desert sun works on your car every single day it's parked outside.",
      costs: [
        {
          label: "A cabin you can't touch",
          body: "Leave it in an uncovered lot on a summer afternoon and the dash, the buckles and the wheel get genuinely painful to touch. The A/C then spends your whole first drive catching up.",
        },
        {
          label: "Dashboards that crack",
          body: "UV and heat cycling break down vinyl and leather. Cracked dash tops and faded door cards are the single most common sun damage we see on ten-year-old Albuquerque cars.",
        },
        {
          label: "Glare on every westbound drive",
          body: "Anyone heading home toward the Rio Grande at 6pm knows the problem. Low sun off the hood is not a small annoyance — it's the reason people squint through half their commute.",
        },
        {
          label: "Everything on display",
          body: "A clear rear window shows every bag, tool and laptop in the car. Privacy film is the cheapest deterrent there is.",
        },
      ],
    },
    benefits: [
      {
        title: "It stays cooler, and stays cooler faster",
        body: "Quality film rejects a large share of the infrared energy that actually carries heat. The practical version: the car cools down quicker when you start it, and the A/C stops fighting the glass.",
      },
      {
        title: "Blocks the UV that wrecks interiors",
        body: "Window film blocks the overwhelming majority of ultraviolet light. That's what protects your dash, your leather and the arm you rest on the door every day.",
      },
      {
        title: "Glare drops immediately",
        body: "Low-angle morning and evening sun is the reason most people finally call. A mid-range shade takes the edge off without making the car feel dark inside.",
      },
      {
        title: "Privacy without going illegal",
        body: "New Mexico allows a genuinely dark 20% on every window but the windshield — darker than most states. You can have real privacy and still pass a meter check.",
      },
      {
        title: "It looks finished",
        body: "Factory glass on most cars looks unfinished. An even, correctly matched shade across every window is the cheapest thing you can do to make a car look sorted.",
      },
      {
        title: "It doesn't turn purple",
        body: "Cheap dyed film fades to purple and bubbles in this climate — usually inside two summers. Carbon and ceramic films are colour-stable, which is most of what you're paying for.",
      },
    ],
    options: {
      title: "Carbon or ceramic",
      intro:
        "We install two tiers. The honest difference is heat rejection, not darkness — a 20% carbon and a 20% ceramic look the same from the street and feel completely different in August.",
      items: [
        {
          name: "Carbon",
          tag: "The value pick",
          body: "Colour-stable carbon film. No dye, so it won't purple or fade. Solid heat and glare reduction and a clean matte-black look. For a car that lives in a garage or gets driven mostly at either end of the day, this is genuinely enough film.",
          bestFor: "Daily drivers, garage-kept cars, budget-conscious builds",
        },
        {
          name: "Ceramic",
          tag: "What most people leave with",
          body: "Nano-ceramic construction rejects substantially more infrared — the part of sunlight you feel as heat — at the same visible shade. If the car parks outside at work, or it's black, or you have kids in the back, this is the one worth the difference.",
          bestFor: "Cars parked outside, dark paint, long commutes, rear passengers",
        },
      ],
    },
    truths: {
      does: [
        "Cuts the heat coming through the glass",
        "Blocks the UV that fades and cracks interiors",
        "Reduces glare, day and night",
        "Adds privacy and makes contents harder to see",
        "Holds shattered glass together in a break",
      ],
      doesNot: [
        "Make an un-air-conditioned car cold",
        "Stop heat coming through the roof, doors or floor",
        "Survive being scrubbed with ammonia glass cleaner",
        "Go on perfectly clear — every film has some visible shade",
        "Get installed and rolled down the same hour (give it a few days to cure)",
      ],
    },
    included: [
      "Glass cleaned and decontaminated before any film touches it",
      "Film cut to your vehicle's exact window pattern",
      "Every window on the car, or just the ones you want",
      "Shade recommended per window for New Mexico's 20% limit",
      "A walkthrough at pickup on curing and how to clean it",
    ],
    process: [
      {
        title: "Tell us the car",
        body: "Year, make, model and what's bothering you — heat, glare, privacy or looks.",
      },
      {
        title: "We recommend a shade",
        body: "Per window, based on how you drive and what's legal here. No upsell to film you don't need.",
      },
      {
        title: "Drop it off",
        body: "Bring it to the shop on Vista Alameda. Walk-ins are welcome, but calling ahead gets you a slot.",
      },
      {
        title: "We install",
        body: "Glass prepped, film laid, edges finished. The car stays inside the whole time.",
      },
      {
        title: "Pick it up",
        body: "We'll show you the curing rules — a few days before you roll the windows down.",
      },
    ],
    faqs: [
      {
        q: "How dark can I legally go in New Mexico?",
        a: "New Mexico allows 20% VLT on the front sides, rear sides and rear window — darker than most states permit. The windshield is limited to non-reflective film above the AS-1 line. We'll confirm the current rule for your vehicle before we install; our full New Mexico tint law guide covers the detail.",
      },
      {
        q: "What percentage should I actually pick?",
        a: "Most people land on 20% on the rears for privacy with something lighter up front so night visibility stays comfortable. If the goal is heat rather than looks, the film tier matters far more than the number — a light ceramic will out-cool a dark carbon every time.",
      },
      {
        q: "Does ceramic tint really reduce heat, or is that marketing?",
        a: "It's real, and it's measurable. Heat you feel is mostly infrared, and ceramic films are built to reject infrared specifically rather than just darkening the glass. That's why a light ceramic can feel cooler than a much darker cheap film. What it won't do is turn a hot car cold on its own.",
      },
      {
        q: "How long before I can roll my windows down?",
        a: "A few days is the safe answer, longer in cold weather. You'll likely see haze or small water pockets while it cures — that's normal and it clears as the moisture leaves.",
      },
      {
        q: "Can you remove my old tint?",
        a: "Yes, and we'd rather do it properly than lay new film over failing old film. Removal is quoted with the job — bubbled or purpling film takes longer to strip, especially on rear glass with defroster lines.",
      },
      {
        q: "Do you tint trucks and SUVs?",
        a: "Constantly. Larger glass takes more film and more time, so it's priced accordingly — you'll get the number before we start.",
      },
      {
        q: "What about the windshield?",
        a: "We can do a visor strip above the AS-1 line, and a full clear or near-clear UV windshield film is a popular add-on for people who want heat rejection without changing how the glass looks. Ask when you get your quote.",
      },
    ],
    quote: {
      heading: "Get a tint quote",
      sub: "Tell us the vehicle and what's bothering you. We'll come back with a shade recommendation and a flat number.",
    },
    goalOptions: [
      "Heat — the car bakes",
      "Glare on my commute",
      "Privacy / security",
      "Looks",
      "Protecting the interior",
      "Removing old tint",
    ],
    related: ["ceramic-coating", "paint-protection-film", "commercial-window-tint"],
  },

  /* ================================================== CERAMIC COATING === */
  {
    slug: "ceramic-coating",
    route: "/ceramic-coating",
    key: "ceramic",
    leadValue: "Ceramic Coating",
    serviceName: "Ceramic Coating",
    navLabel: "Ceramic Coating",
    metaTitle: "Ceramic Coating in Albuquerque, NM | Paint Protection — Evo Solutions",
    metaDescription:
      "Professional ceramic coating in Albuquerque. Deep gloss, water and dirt that release easily, and paint protected from high-desert sun. Prep done properly. Free quote.",
    eyebrow: "Ceramic Coating · Albuquerque",
    headline: "Gloss that survives the high desert.",
    sub: "A coating is a semi-permanent layer bonded to your clear coat. Done right, the car stays glossier, washes in half the time and stops oxidising under New Mexico sun. Done fast, it locks in every swirl that was already there.",
    imageSlot: "service_ceramic",
    cardBlurb:
      "A bonded layer that makes paint easier to clean, harder to stain, and noticeably glossier for years.",
    cardBenefits: ["Deeper gloss", "Washes faster", "Resists staining", "Multi-year protection"],
    problem: {
      title: "What kills paint in Albuquerque",
      body: "Paint here doesn't die from one thing. It gets ground down by four, all year round.",
      costs: [
        {
          label: "Relentless UV",
          body: "At 5,300 feet with a sky that's clear most of the year, clear coat oxidises faster here than it does in most of the country. Reds and blacks go chalky first.",
        },
        {
          label: "Hard water spots",
          body: "Albuquerque water is hard. Let it dry on hot paint — from a sprinkler, a hose, a car wash — and the minerals etch into the clear coat. Those rings don't wipe off.",
        },
        {
          label: "Monsoon dust and grit",
          body: "Late-summer storms drop dust onto wet paint. Wipe that off with a dry towel and you've just sanded your car with New Mexico.",
        },
        {
          label: "Automatic car washes",
          body: "Spinning brushes put in the fine swirl marks you see under the gas-station canopy. That haze is thousands of tiny scratches.",
        },
      ],
    },
    benefits: [
      {
        title: "Washing gets genuinely easier",
        body: "This is the benefit owners actually notice. Dirt and water release instead of clinging, so a wash is a rinse and a gentle pass rather than a fight with bug splatter.",
      },
      {
        title: "Gloss you can see from across the lot",
        body: "A coating adds real depth on top of corrected paint. Metallics flake harder and dark colours go properly wet-looking.",
      },
      {
        title: "A sacrificial barrier",
        body: "Bird droppings, bug guts, sap and water spots hit the coating rather than your clear coat. You still need to clean them off — you just have far more time before they do damage.",
      },
      {
        title: "It doesn't wash off",
        body: "Wax is gone in weeks and a sealant in months. A coating is chemically bonded and measured in years, which is the whole point of paying for one.",
      },
      {
        title: "Resale looks after itself",
        body: "A coated car that's been maintained looks years younger than its mileage. That shows up directly in what a dealer or private buyer offers.",
      },
      {
        title: "It stacks with film",
        body: "Coating over PPF is the strongest combination available — the film takes impacts, the coating keeps the film slick and easy to clean.",
      },
    ],
    truths: {
      does: [
        "Make the car far easier and faster to wash",
        "Add measurable gloss and depth to corrected paint",
        "Resist UV oxidation, chemical staining and water spotting",
        "Last years rather than weeks",
        "Give bird droppings and sap a barrier to sit on",
      ],
      doesNot: [
        "Stop rock chips — that is what paint protection film is for",
        "Prevent scratches from automatic car washes",
        "Mean you never have to wash the car again",
        "Fix paint that wasn't corrected first",
        "Survive being polished off, which undoes the coating",
      ],
    },
    included: [
      "Full wash, chemical decontamination and clay to strip embedded fallout",
      "Machine polish to remove swirls before anything is sealed in",
      "Panel wipe so the coating bonds to bare clear coat, not polish oil",
      "Coating applied and levelled panel by panel indoors",
      "Cure time in the shop before the car goes back out",
      "A straight answer at pickup on how to wash it and what to avoid",
    ],
    process: [
      {
        title: "Look at the paint",
        body: "We need to see the car. Coating quotes depend on paint condition far more than vehicle size.",
      },
      {
        title: "Agree the correction",
        body: "How far we take the polishing stage is your call, and it's the biggest lever on both the result and the price.",
      },
      {
        title: "Leave it with us",
        body: "This is a multi-day service. Prep is most of it — the coating itself is the fast part.",
      },
      {
        title: "Cure indoors",
        body: "The coating hardens in the shop, out of dust and away from water.",
      },
      {
        title: "Collect and maintain",
        body: "You'll leave knowing exactly how to wash it so the coating lasts as long as it should.",
      },
    ],
    faqs: [
      {
        q: "Is ceramic coating worth it in New Mexico?",
        a: "More here than in a mild, cloudy climate. The two things a coating is best at — resisting UV oxidation and shedding hard-water minerals — are exactly the two things working hardest on paint in Albuquerque. If the car lives outside, it earns its keep.",
      },
      {
        q: "How long does it last?",
        a: "That depends on the coating we agree on and, honestly, on how you wash it. A coated car put through spinning brushes every fortnight will not go the distance. We'll tell you the realistic figure for the product we're quoting rather than a headline number.",
      },
      {
        q: "Ceramic coating or PPF?",
        a: "They solve different problems. A coating handles chemical damage: UV, water spots, bird droppings, oxidation. Film handles physical damage: rock chips and scratches. Plenty of customers do film on the front end and coat the whole car — that combination covers both.",
      },
      {
        q: "Can you coat over the tint or the film?",
        a: "Coating goes on paint, and there are coatings made for glass and for PPF too. If you're doing several services, do them in one visit — it's less time without the car and we can sequence it properly.",
      },
      {
        q: "Do I still have to wash it?",
        a: "Yes. Anyone who tells you otherwise is selling something. What changes is the effort: dirt releases instead of bonding, so a wash is quicker and you're far less likely to scratch the car doing it.",
      },
      {
        q: "How do I wash a coated car?",
        a: "Two-bucket hand wash or a touchless setup. Skip the gas-station brushes — they mar any finish, coated or not. Dry with a clean towel rather than letting hard water sit on hot panels.",
      },
      {
        q: "Why does prep cost more than the coating?",
        a: "Because a coating locks in whatever is underneath it. Applied over swirls, it makes swirls permanent and glossy. The polishing stage is where the result actually comes from — the bottle is the easy part.",
      },
    ],
    quote: {
      heading: "Get a coating quote",
      sub: "Tell us the vehicle and the paint's current condition. Photos help a lot here — you can attach them below.",
    },
    goalOptions: [
      "Maximum gloss",
      "Easier washing",
      "Protecting new paint",
      "Reviving older paint",
      "Coating over PPF",
      "Not sure — need advice",
    ],
    related: ["paint-protection-film", "auto-detailing", "window-tint"],
  },

  /* =============================================== PAINT PROTECTION ===== */
  {
    slug: "paint-protection-film",
    route: "/paint-protection-film",
    key: "ppf",
    leadValue: "PPF",
    serviceName: "Paint Protection Film",
    navLabel: "PPF / Clear Bra",
    metaTitle: "Paint Protection Film (PPF) in Albuquerque, NM | Clear Bra — Evo Solutions",
    metaDescription:
      "Self-healing paint protection film installed in Albuquerque. Stop rock chips from I-25 and I-40 gravel before they start. Partial front to full body. Free quote.",
    eyebrow: "Paint Protection Film · Albuquerque",
    headline: "Rock chips stop at the film.",
    sub: "If you commute on I-25 or I-40, you already know what a gravel truck does to a front bumper. Paint protection film is a clear urethane layer that takes the hit instead of your paint — and light scratches in it close back up in the sun.",
    imageSlot: "service_ppf",
    cardBlurb:
      "Clear self-healing film over the panels that actually get hit — so the paint underneath stays factory.",
    cardBenefits: [
      "Rock chip defence",
      "Self-healing layer",
      "Invisible when done right",
      "Removable later",
    ],
    problem: {
      title: "Why front ends look old first",
      body: "Look at any five-year-old car in this city and the damage is in the same four places. It's not bad luck — it's physics and road surface.",
      costs: [
        {
          label: "Interstate gravel",
          body: "I-25 and I-40 carry constant construction and gravel haulers. At 70mph a stone off the truck ahead has more than enough energy to go through clear coat and into primer.",
        },
        {
          label: "Chips become rust",
          body: "A chip isn't cosmetic once it reaches metal. Water gets under the edge of the paint and it starts lifting from the inside out.",
        },
        {
          label: "Repaints never quite match",
          body: "A resprayed bumper is visible in the right light for the life of the car, and it's the first thing an appraiser looks for. It also flags on a vehicle history report.",
        },
        {
          label: "Bugs and tar etch",
          body: "Splatter left through a hot afternoon etches clear coat. On a front bumper that's a weekly event in summer.",
        },
      ],
    },
    benefits: [
      {
        title: "It absorbs the impact",
        body: "Urethane is thick and elastic. Stones that would have chipped paint bounce off the film instead — that's the whole product in one sentence.",
      },
      {
        title: "Light scratches disappear",
        body: "Modern film is self-healing. Swirls and fine scratches in the film close up with heat, whether that's a hot afternoon or warm water from a hose.",
      },
      {
        title: "You shouldn't be able to see it",
        body: "Cut to the panel and wrapped around the edges where the panel allows, film should be invisible at arm's length. Visible seams across the middle of a hood are an install problem, not a film problem.",
      },
      {
        title: "The paint underneath stays original",
        body: "Film comes off years later leaving factory paint. Original paint is worth real money at resale, especially on anything enthusiast.",
      },
      {
        title: "Coverage matched to how you drive",
        body: "You don't need a full body wrap to solve a rock chip problem. Most people's answer is the front end — and we'll say so rather than quoting the biggest number.",
      },
      {
        title: "It stacks with a coating",
        body: "A coating on top of film keeps the film slick, easier to clean and better protected from staining. The two are complementary, not alternatives.",
      },
    ],
    options: {
      title: "How much coverage do you need?",
      intro:
        "Coverage is the only real decision here. We'll walk the car with you and point at exactly what's getting hit — then quote what solves it.",
      items: [
        {
          name: "Partial front",
          tag: "The common-sense option",
          body: "Bumper, the leading section of the hood, and the mirrors. Covers where the overwhelming majority of chips land, at the lowest cost. The trade-off is a film edge across the hood, which is visible up close on some colours.",
          bestFor: "Daily drivers, leased cars, anyone chip-shy on a budget",
        },
        {
          name: "Full front",
          tag: "What most people choose",
          body: "The whole hood, the whole front bumper, both front fenders and the mirrors. No line across the hood, and everything that faces forward is covered. This is the option that actually solves the problem.",
          bestFor: "Highway commuters, new cars, dark paint that shows chips",
        },
        {
          name: "Track / extended",
          tag: "For hard use",
          body: "Full front plus rocker panels, A-pillars, roof leading edge and the areas behind the wheels that catch thrown debris.",
          bestFor: "Track days, canyon driving, long-distance highway cars",
        },
        {
          name: "Full body",
          tag: "Maximum",
          body: "Every painted panel. The car stays essentially as-delivered underneath for as long as the film is on it.",
          bestFor: "Exotics, collectibles, anything you intend to keep",
        },
      ],
    },
    truths: {
      does: [
        "Stop rock chips and road debris damage",
        "Absorb scratches that would otherwise reach paint",
        "Self-heal light swirls with heat",
        "Come off later leaving original paint",
        "Protect against bug and tar etching",
      ],
      doesNot: [
        "Prevent dents or damage from a real collision",
        "Make paint scratch-proof",
        "Stay invisible if it's installed badly",
        "Replace a ceramic coating's chemical resistance",
        "Go on well over damaged or chipped paint — that gets fixed first",
      ],
    },
    included: [
      "Paint washed, decontaminated and inspected before anything goes on",
      "Existing chips and defects pointed out before we start, not after",
      "Film cut to your exact model's pattern",
      "Edges wrapped wherever the panel allows",
      "Installed indoors to keep dust out of the adhesive",
      "A follow-up look a week or two later once everything has settled",
    ],
    process: [
      {
        title: "Walk the car",
        body: "We look at what's already chipped and where. That decides the coverage worth quoting.",
      },
      {
        title: "Pick coverage",
        body: "Partial front, full front, extended or full body — matched to how and where you actually drive.",
      },
      {
        title: "Prep the paint",
        body: "Film magnifies whatever is under it, so the paint gets properly cleaned and decontaminated first.",
      },
      {
        title: "Install indoors",
        body: "Panels are laid wet, squeegeed out and the edges wrapped. This takes as long as it takes.",
      },
      {
        title: "Settle and re-check",
        body: "Any remaining moisture clears over the following days. Bring it back and we'll look it over.",
      },
    ],
    faqs: [
      {
        q: "What does PPF actually protect against?",
        a: "Impact and abrasion: rock chips, road debris, bug etching, sand, light scratches and car-wash marring. It is not body armour — it won't help in a collision or stop a door ding.",
      },
      {
        q: "Will it yellow?",
        a: "Old films did. Current top-tier urethane is made not to, and quality film carries a manufacturer warranty covering yellowing and cracking. We'll give you the specific warranty document for the film we quote so you have it in writing rather than taking our word for it.",
      },
      {
        q: "Is it visible?",
        a: "It shouldn't be, at normal viewing distance. Where you may see it is at the edges of a partial coverage package — that hood line is the main reason people upgrade to full front.",
      },
      {
        q: "Can I wash it normally?",
        a: "After the first week, yes. Hand wash or touchless is best. Avoid pressure-washing straight at an edge, which is the one thing that can lift film.",
      },
      {
        q: "PPF or ceramic coating?",
        a: "Film for physical damage, coating for chemical damage. If rock chips are your problem, no amount of coating will help — you need film. Many customers do both: film on the front, coating over everything.",
      },
      {
        q: "Can you film a car that already has chips?",
        a: "We can, but the chips stay visible under the film and get sealed in. If the front end is already marked, talk to us about correcting or touching in first — it's the difference between hiding a problem and fixing it.",
      },
      {
        q: "How long does it take?",
        a: "Longer than people expect. A full front is a multi-day job done properly, and full body is longer again. We'd rather quote you honest days than rush a panel.",
      },
    ],
    quote: {
      heading: "Get a PPF quote",
      sub: "Tell us the car and how you drive it. Photos of the front end help us quote coverage accurately.",
    },
    goalOptions: [
      "Partial front",
      "Full front",
      "Track / extended coverage",
      "Full body",
      "Just the high-impact areas",
      "Not sure — walk me through it",
    ],
    related: ["ceramic-coating", "window-tint", "auto-detailing"],
  },

  /* ====================================================== DETAILING ===== */
  {
    slug: "auto-detailing",
    route: "/auto-detailing",
    key: "detail",
    leadValue: "Detail",
    serviceName: "Auto Detailing",
    navLabel: "Detailing",
    metaTitle: "Auto Detailing in Albuquerque, NM | Interior & Exterior — Evo Solutions",
    metaDescription:
      "Interior and exterior auto detailing in Albuquerque. Deep interior cleans, paint correction, leather care and engine bays. The shop that was MAD Detailing NM.",
    eyebrow: "Auto Detailing · Albuquerque",
    headline: "The detail work we built the shop on.",
    sub: "Before the film and the coatings, this was a detail shop — it's where the Google reviews came from. Interior deep cleans, machine polishing, leather, engine bays. Done carefully, priced by what the car actually needs.",
    imageSlot: "service_detail",
    cardBlurb:
      "Interior deep cleans and exterior correction that make a car feel genuinely looked after again.",
    cardBenefits: ["Interior extraction", "Paint correction", "Leather care", "Engine bays"],
    problem: {
      title: "Where cars go wrong here",
      body: "Detailing in a dusty, high-UV city isn't the same job as detailing on the coast. These are the four things we're usually fixing.",
      costs: [
        {
          label: "Dust in everything",
          body: "Fine desert dust gets into vents, seams, seat rails and the gap under the console. Vacuuming the carpets doesn't touch it — it needs air, brushes and steam.",
        },
        {
          label: "Baked-on interiors",
          body: "Sun-cooked dashboards go dull and grey, and old dressings turn greasy and streaky. Getting that back takes stripping the previous product off first.",
        },
        {
          label: "Swirled paint",
          body: "Automatic washes and dry-wiping put in the fine circular scratches that make a car look hazy in direct sun. Polishing removes them; glaze just hides them for a month.",
        },
        {
          label: "Life happening in the car",
          body: "Kid seats, dog hair, spilled coffee, job-site dust. None of it is a problem — it's just time, and it's what extraction and steam are for.",
        },
      ],
    },
    benefits: [
      {
        title: "Interiors get properly decontaminated",
        body: "Hot-water extraction on carpets and cloth, steam into the vents and seams, brushes through the trim. The difference between a clean car and a detailed one is entirely in the places you can't reach.",
      },
      {
        title: "Correction, not filler",
        body: "Machine polishing actually removes swirls and oxidation instead of masking them with glaze that washes off. What you see at pickup is what you keep.",
      },
      {
        title: "Leather cleaned before it's fed",
        body: "Conditioner on top of dirty leather seals the dirt in. It gets cleaned first, then conditioned — which is why it comes back matte and soft rather than shiny and slick.",
      },
      {
        title: "The right prep for coating",
        body: "If you're planning a ceramic coating, correction is the same work either way. Doing them in one visit means you only pay for the prep once.",
      },
      {
        title: "It holds resale value",
        body: "A clean, unswirled car with a fresh interior photographs better and inspects better. On a private sale that's real money for a day of work.",
      },
      {
        title: "Trucks and work vehicles welcome",
        body: "We do at least as many trucks and job-site vehicles as we do show cars. Nothing that comes through the door surprises us.",
      },
    ],
    included: [
      "Foam wash, wheels and wheel wells, hand dry",
      "Full interior vacuum including under seats and in the seat rails",
      "Hot-water extraction on carpets and cloth upholstery where needed",
      "Steam and detail brushes through vents, seams and console gaps",
      "Leather cleaned, then conditioned",
      "Glass cleaned inside and out — including the top edge people miss",
      "Trim and tyres dressed to a matte finish, not a greasy shine",
    ],
    process: [
      {
        title: "Tell us the condition",
        body: "Be honest about it — photos of the worst areas get you a far more accurate quote.",
      },
      {
        title: "We scope the work",
        body: "Interior only, exterior only, or the full job. Paint correction is quoted separately once we've seen the paint.",
      },
      {
        title: "Book it in",
        body: "Interior details and full details are half-day to full-day jobs depending on condition.",
      },
      {
        title: "We work through it",
        body: "Wash and decontamination first, then interior, then paint. Order matters.",
      },
      {
        title: "Walk around at pickup",
        body: "We'll show you what came out, what didn't, and what would need correction to fix properly.",
      },
    ],
    faqs: [
      {
        q: "How long does a detail take?",
        a: "An interior detail is a couple of hours of solid work; a full interior-and-exterior is most of a day. Paint correction is quoted by condition and can run longer. We'll give you a realistic window when you drop off rather than a number that makes us rush it.",
      },
      {
        q: "Do I need an appointment?",
        a: "Walk-ins are welcome and we'll always take a look. For anything beyond a wash, calling ahead means we can set aside the time properly.",
      },
      {
        q: "Can you get pet hair out?",
        a: "Yes. Embedded pet hair in cloth seats is one of the more time-consuming jobs there is, so mention it when you book and we'll allow for it.",
      },
      {
        q: "What's the difference between a detail and a car wash?",
        a: "A wash cleans the outside surfaces. A detail decontaminates the paint, gets into the parts of the interior a vacuum can't reach, and corrects finishes. Different job, different tools, different result.",
      },
      {
        q: "Will detailing remove scratches?",
        a: "Machine polishing removes swirls and light scratches — the ones you can't catch a fingernail in. Deeper scratches that have gone through the clear coat need paint, not polish, and we'll tell you which yours are.",
      },
      {
        q: "Do you work on trucks and SUVs?",
        a: "Constantly — probably more than sedans. Bigger vehicles take longer, so they're priced accordingly and quoted before we start.",
      },
      {
        q: "Should I detail before selling?",
        a: "It's the highest-return day of work you can put into a car you're about to sell. Photos of a corrected, properly cleaned car change what people are willing to offer before they've even driven it.",
      },
    ],
    quote: {
      heading: "Get a detailing quote",
      sub: "Tell us what shape it's in — photos of the interior get you a much more accurate number.",
    },
    goalOptions: [
      "Interior deep clean",
      "Exterior only",
      "Full interior + exterior",
      "Paint correction",
      "Getting it ready to sell",
      "Regular upkeep",
    ],
    related: ["ceramic-coating", "window-tint", "paint-protection-film"],
  },

  /* ============================================ COMMERCIAL / HOME ====== */
  {
    slug: "commercial-window-tint",
    route: "/commercial-window-tint",
    key: "commercial",
    leadValue: "Window tint",
    serviceName: "Commercial & Home Window Tint",
    navLabel: "Commercial & Home",
    metaTitle: "Commercial & Home Window Tint in Albuquerque, NM | Evo Solutions",
    metaDescription:
      "Flat-glass window film for Albuquerque offices, storefronts, warehouses and homes. Cut cooling costs, kill glare, stop fading. Free on-site assessment.",
    eyebrow: "Commercial & Home · Albuquerque",
    headline: "The same sun is running up your power bill.",
    sub: "Architectural window film goes onto the glass you already have — offices, storefronts, warehouses, restaurants and houses. It cuts the heat load, kills screen glare and stops the sun bleaching everything inside, without replacing a single window.",
    imageSlot: "service_commercial",
    cardBlurb:
      "Flat-glass film for buildings: lower cooling load, no glare on screens, and no more sun-faded stock.",
    cardBenefits: [
      "Lower cooling load",
      "Glare control",
      "Fade protection",
      "Security film option",
    ],
    problem: {
      title: "What west-facing glass costs a building",
      body: "Most Albuquerque buildings have one or two elevations doing all the damage. Usually it's the west side from about two o'clock onwards.",
      costs: [
        {
          label: "Cooling that never catches up",
          body: "Large single-pane storefront glass acts like a heater from mid-afternoon. The system runs flat out and the room nearest the glass is still unusable.",
        },
        {
          label: "Rooms nobody wants to sit in",
          body: "Every office has the desk by the window that nobody takes in summer. That's floor space you're paying rent on and not using.",
        },
        {
          label: "Faded stock and furniture",
          body: "UV bleaches merchandise, menus, artwork, flooring and upholstery. Retailers end up discounting sun-faded stock they can't sell at full price.",
        },
        {
          label: "Glare on every screen",
          body: "Monitors, POS terminals, TVs behind a bar. If staff are angling screens away from the window, film solves it more cheaply than blinds nobody ever opens.",
        },
      ],
    },
    benefits: [
      {
        title: "Solar control where it pays",
        body: "Film rejects a large portion of the solar energy coming through the glass. On west- and south-facing elevations that's where the payback is quickest.",
      },
      {
        title: "Glare goes without going dark",
        body: "Modern film cuts glare while keeping the space bright. You don't have to choose between a usable screen and a dark room.",
      },
      {
        title: "UV fade protection",
        body: "Blocking the overwhelming majority of ultraviolet protects stock, flooring, artwork and furniture — the costs that quietly add up in a retail space.",
      },
      {
        title: "Daytime privacy",
        body: "Reflective and frosted options give privacy at ground-floor level without bars, blinds or replacing glass. Good for medical suites and street-facing offices.",
      },
      {
        title: "Security and safety film",
        body: "A thicker bonded film holds glass together when it breaks — slowing forced entry and containing shattered glass from storms and accidents.",
      },
      {
        title: "Installed around your hours",
        body: "Restaurants and retail can't lose a trading day. We schedule around opening hours, including evenings, so the doors stay open.",
      },
    ],
    included: [
      "Free on-site assessment and measure",
      "Film specified per elevation — west glass rarely wants the same film as north",
      "A written scope before anything is ordered",
      "Clean flat-glass installation with the space protected",
      "Scheduling around trading or office hours",
      "Manufacturer warranty documentation for the film supplied",
    ],
    process: [
      {
        title: "Tell us about the space",
        body: "Type of building, rough glass area, and what's driving it — heat, glare, fading, privacy or security.",
      },
      {
        title: "We come and look",
        body: "On-site assessment across the metro. We measure and check which elevations are actually the problem.",
      },
      {
        title: "Written proposal",
        body: "Film specified per elevation with a fixed number. No surprises once we're on site.",
      },
      {
        title: "Install around your hours",
        body: "Evenings and closed days where that keeps you trading.",
      },
      {
        title: "Walk the job together",
        body: "We check every pane with you before we leave and hand over the film warranty.",
      },
    ],
    faqs: [
      {
        q: "Do you do homes as well as businesses?",
        a: "Both. The same solar-control and security films work on residential glass — sunrooms, west-facing living rooms, big picture windows and whole houses. Tell us the space and we'll spec it.",
      },
      {
        q: "Will the windows look mirrored?",
        a: "Only if you want that. There are nearly clear films that reject heat without visibly changing the glass, right through to reflective privacy finishes. We'll match the look to the building.",
      },
      {
        q: "What is security film?",
        a: "A thicker film bonded to the glass that holds the pane together when it breaks. It slows down a smash-and-grab and contains flying glass in a storm or accident. Common for ground-floor retail and glass doors.",
      },
      {
        q: "Will it cut my cooling bill?",
        a: "On sun-facing glass it reduces the heat load your system has to fight, and that's where the saving comes from. How much depends on your glass area, orientation and system — we'll be straight with you about whether your building is a good candidate.",
      },
      {
        q: "Can film go on double glazing?",
        a: "Often yes, but not always — some film and sealed-unit combinations risk thermal stress. That's exactly the kind of thing the on-site assessment is for, and we'd rather tell you no than damage your glass.",
      },
      {
        q: "How disruptive is the install?",
        a: "Less than people expect. We work pane by pane with the area protected, and we schedule around your hours. Most retail and restaurant jobs happen outside trading time.",
      },
      {
        q: "Do you tint fleet vehicles too?",
        a: "We do — service vans, work trucks and company cars, with pricing that reflects volume. Pick fleet vehicles on the form and we'll fold it into the same quote.",
      },
    ],
    quote: {
      heading: "Book a free on-site assessment",
      sub: "Tell us about the building and what's driving it. We'll come out, measure, and put a fixed number in writing.",
    },
    goalOptions: [
      "Heat & energy savings",
      "Glare reduction",
      "Privacy",
      "Security / safety film",
      "UV & fade protection",
      "Not sure yet",
    ],
    related: ["window-tint", "auto-detailing", "ceramic-coating"],
    variant: "commercial",
    lead: {
      blurb: "Tell us about the space and we'll set up a free on-site assessment.",
      selectLabel: "What are we tinting?",
      selectOptions: [
        "Office",
        "Retail / storefront",
        "Warehouse / industrial",
        "Medical / dental",
        "Restaurant / hospitality",
        "Home / residential",
        "Fleet / company vehicles",
        "Other",
      ],
      goalOptions: [
        "Heat & energy savings",
        "Glare reduction",
        "Privacy",
        "Security / safety film",
        "UV & fade protection",
        "Not sure yet",
      ],
    },
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

/** The four vehicle services, in the order they're sold on the homepage. */
export const autoServices = services.filter((s) => s.variant !== "commercial");
