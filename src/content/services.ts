// Per-service page content. Same rule as site.ts: this is owner-editable
// copy — keep claims honest and Albuquerque-specific.

export type ServiceContent = {
  slug: string;
  /** Must match the service name in site.services so the quote form preselects. */
  serviceName: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  tag: string;
  headline: string;
  intro: string;
  image: string;
  sellingPoints: { title: string; body: string }[];
  included: string[];
  faqs: { q: string; a: string }[];
  priceNote: string;
};

export const services: ServiceContent[] = [
  {
    slug: "window-tint",
    serviceName: "Window Tint",
    navLabel: "Window Tint",
    metaTitle: "Window Tint in Albuquerque, NM — Ceramic Film, Lifetime Warranty | Evo Solutions",
    metaDescription:
      "Professional ceramic window tint in Albuquerque. Computer-cut film, legal-shade guidance for New Mexico, lifetime warranty. Flat-rate pricing from $249.",
    tag: "Signature Service",
    headline: "Window tint built for New Mexico sun.",
    intro:
      "Albuquerque gets over 300 days of relentless sun a year. Our ceramic films reject the heat, block 99% of UV, and give your car a clean factory look — installed edge-to-edge in a climate-controlled bay and backed for life.",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
    sellingPoints: [
      {
        title: "Computer-cut, never hand-shaved",
        body: "Every panel is plotter-cut to your exact glass pattern before it touches the car. No blades on your windows, no shaved edges, no gaps.",
      },
      {
        title: "Legal-shade guidance included",
        body: "New Mexico allows darker film than most states, but there are still limits. We confirm what's legal for each window before we install — so you never get flagged at inspection.",
      },
      {
        title: "Ceramic, carbon, or IR — explained straight",
        body: "We stock three film tiers and we'll tell you plainly what the price difference buys. Most drivers land on ceramic; we'll never upsell you into film you don't need.",
      },
    ],
    included: [
      "Full glass prep and decontamination",
      "Computer-cut film for your exact vehicle",
      "Edge-to-edge installation, dust-controlled bay",
      "Legal-shade consultation for New Mexico",
      "Lifetime manufacturer warranty, transferable",
    ],
    faqs: [
      {
        q: "How dark can I legally go in New Mexico?",
        a: "New Mexico allows 20% VLT on side and rear windows — darker than most states. The windshield is limited to a visor strip above the AS-1 line. We'll walk you through it during your quote, and our full guide covers the details.",
      },
      {
        q: "How long until I can roll my windows down?",
        a: "We recommend 3–4 days in summer and up to a week in winter while the film fully cures. You'll see some hazing or small water pockets during that time — completely normal, they evaporate as it dries.",
      },
    ],
    priceNote: "Full-vehicle carbon tint starts at $249; ceramic from $399. Exact quote depends on vehicle and film — no surprises at pickup.",
  },
  {
    slug: "ceramic-coating",
    serviceName: "Ceramic Coating",
    navLabel: "Ceramic Coating",
    metaTitle: "Ceramic Coating in Albuquerque, NM — Multi-Year Paint Protection | Evo Solutions",
    metaDescription:
      "Professional ceramic coating in Albuquerque. Deep gloss, hydrophobic finish, and years of protection from NM sun and road grime. Prepped and applied by certified installers.",
    tag: "Premium Upgrade",
    headline: "Gloss that survives the high desert.",
    intro:
      "Between the UV index, the dust, and the freeway sandblasting, New Mexico is brutal on paint. A properly prepped ceramic coating locks in gloss, sheds water and grime, and keeps your paint from baking — for years, not months.",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
    sellingPoints: [
      {
        title: "Prep is the product",
        body: "A coating only performs on perfect paint. Every coating we do starts with a full decontamination and machine polish — the coating locks in whatever is underneath it, so we make sure that's flawless.",
      },
      {
        title: "Real durability, honestly rated",
        body: "We install coatings rated from 2 to 7 years and tell you exactly what maintenance each needs. A coating isn't 'never wash your car again' — it's 'washing takes ten minutes and the shine comes back every time.'",
      },
      {
        title: "Stacks with tint and PPF",
        body: "Coating over PPF is the strongest protection stack there is. Doing multiple services in one visit also saves you money — ask when you book.",
      },
    ],
    included: [
      "Full wash, iron and clay decontamination",
      "Single-stage machine polish (correction add-on available)",
      "Panel wipe and controlled-environment application",
      "Care instructions + first-wash guidance",
      "Coating warranty registered to your vehicle",
    ],
    faqs: [
      {
        q: "How do I wash a coated car?",
        a: "Two-bucket hand wash or touchless — skip the gas-station brushes, which mar any finish, coated or not. The coating means dirt releases easily and drying is fast. We'll show you the routine at pickup.",
      },
      {
        q: "Ceramic coating or PPF — which do I want?",
        a: "Coating fights chemical damage: UV, water spots, bird droppings, oxidation. PPF fights physical damage: rock chips and scratches. High-impact areas benefit from PPF; the whole car benefits from coating. Many customers do PPF on the front and coat everything.",
      },
    ],
    priceNote: "Ceramic coating packages are quoted by vehicle size and paint condition — request a quote and we'll give you a flat number before any work starts.",
  },
  {
    slug: "paint-protection-film",
    serviceName: "Paint Protection Film",
    navLabel: "PPF",
    metaTitle: "Paint Protection Film (PPF) in Albuquerque, NM — Self-Healing Clear Bra | Evo Solutions",
    metaDescription:
      "Self-healing paint protection film installed in Albuquerque. Stop rock chips from I-25 and I-40 gravel. Full-front and full-body coverage with 10-year warranty.",
    tag: "Ultimate Protection",
    headline: "Rock chips end here.",
    intro:
      "If you drive I-25 or I-40, you already know what gravel trucks do to a front bumper. Self-healing polyurethane film absorbs the hits invisibly — light scratches literally disappear in the sun — and peels off years later leaving factory paint underneath.",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
    sellingPoints: [
      {
        title: "Self-healing top coat",
        body: "Swirls and light scratches in the film vanish with heat — sunlight or warm water. The film takes the damage so your paint never sees it.",
      },
      {
        title: "Coverage that matches your driving",
        body: "Partial front (bumper, partial hood, mirrors), full front, track package, or full body. We'll recommend coverage based on how and where you actually drive — not the biggest invoice.",
      },
      {
        title: "Invisible edges",
        body: "Wrapped edges and computer-cut patterns mean no visible lines on your paint. Most people can't tell a car has film on it — which is the point.",
      },
    ],
    included: [
      "Paint decontamination and inspection",
      "Computer-cut pattern for your exact model",
      "Wrapped edges wherever the panel allows",
      "Post-install inspection at 1–2 weeks",
      "10-year manufacturer warranty against yellowing and cracking",
    ],
    faqs: [
      {
        q: "Will PPF yellow over time?",
        a: "The old films did. Modern top-tier film carries a 10-year warranty specifically against yellowing, cracking, and delamination. Combined with our install warranty, you're covered.",
      },
      {
        q: "Can I wash it like normal paint?",
        a: "Yes — after the first week. Hand wash or touchless is best. Add a ceramic coating on top and it sheds dirt even faster.",
      },
    ],
    priceNote: "PPF is quoted by coverage area. Full-front packages are the most popular for daily drivers — request a quote for a flat price.",
  },
  {
    slug: "detailing",
    serviceName: "Automotive Detailing",
    navLabel: "Detailing",
    metaTitle: "Auto Detailing in Albuquerque, NM — Interior & Exterior | Evo Solutions",
    metaDescription:
      "Professional auto detailing in Albuquerque: paint correction, interior deep cleans, leather care, engine bays. The shop formerly known as MAD Detailing NM — 5.0 stars on Google.",
    tag: "Restore & Refresh",
    headline: "The detail work we built our name on.",
    intro:
      "Before the tint and the film, this shop was built on detailing — it's where our 5.0-star Google rating comes from. Interior deep cleans, machine polishing, leather care, engine bays: done carefully, priced fairly.",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1400&q=80",
    sellingPoints: [
      {
        title: "Correction, not just gloss",
        body: "Machine polishing that actually removes swirls and oxidation instead of hiding them under filler glaze. What you see at pickup is what you keep.",
      },
      {
        title: "Interiors done properly",
        body: "Extraction, steam, leather cleaned and conditioned, vents and seams detailed. Kid seats, dog hair, spilled coffee — we've seen worse, bring it in.",
      },
      {
        title: "Maintenance plans",
        body: "Regulars keep their vehicles on a schedule with us — monthly or quarterly upkeep at a lower rate than one-off deep cleans. Ask about it.",
      },
    ],
    included: [
      "Foam wash and hand dry",
      "Full interior vacuum, steam and wipe-down",
      "Leather cleaning and conditioning",
      "Glass inside and out",
      "Dressing on trim and tires",
    ],
    faqs: [
      {
        q: "How long does a full detail take?",
        a: "A maintenance detail runs 2–3 hours. Full interior-and-exterior deep cleans are usually a half day. Paint correction is quoted by condition — we'll tell you exactly when you drop off.",
      },
      {
        q: "Do you work on trucks and SUVs?",
        a: "Constantly — probably more than sedans. Larger vehicles are priced accordingly and the quote is flat before we start.",
      },
    ],
    priceNote: "Details are priced by vehicle size and condition, flat-rate before we start. Request a quote or call for same-week availability.",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
