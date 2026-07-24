// Central site configuration — swap this out per tenant in ShopFlow.
export type ServiceKey = "tint" | "ceramic" | "ppf" | "detail";

// NOTE: business details, stats, and testimonials below are DEMO PLACEHOLDERS.
// Replace every value with the real shop's data before launching a tenant —
// fabricated review counts/testimonials on a live site are an FTC problem.
export const site = {
  business: {
    name: "Evo Solutions",
    tagline: "Premium Window Tint & Automotive Protection",
    phone: "(505) 420-5747",
    phoneHref: "tel:+15054205747",
    email: "Angelo@evosolution.org",
    address: "3500 Vista Alameda NE, Suite A · Albuquerque, NM 87113",
    // Structured parts for LocalBusiness schema (local SEO)
    addressParts: {
      street: "3500 Vista Alameda NE A",
      city: "Albuquerque",
      state: "NM",
      zip: "87113",
    },
    hours: [
      { day: "Mon – Sat", value: "10:00 AM – 6:00 PM" },
      { day: "Sunday", value: "Closed" },
    ],
    social: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      youtube: "https://youtube.com",
    },
  },
  stats: [
    { value: "5.0★", label: "Google Rating" },
    { value: "18", label: "Five-Star Reviews" },
    { value: "Lifetime", label: "Film Warranty" },
    { value: "ABQ", label: "Locally Owned" },
  ],
  filmBrands: ["XPEL", "3M", "SunTek", "LLumar", "Solar Gard", "Rayno"],
  reasons: [
    {
      title: "Heat Reduction",
      body: "Reject up to 96% of infrared heat. Your cabin stays cooler on the hottest days — without cranking the A/C.",
    },
    {
      title: "UV Protection",
      body: "Blocks 99% of harmful UV rays. Protects your skin and prevents your interior from cracking and fading.",
    },
    {
      title: "Privacy & Security",
      body: "Keep prying eyes out. Premium films discourage theft and give you a private, focused drive.",
    },
    {
      title: "Interior Protection",
      body: "Leather, dash, and trim stay showroom-fresh. Preserves resale value for years to come.",
    },
    {
      title: "Elevated Appearance",
      body: "Sleek, cohesive, luxury-grade look. Tint transforms the character of any vehicle instantly.",
    },
    {
      title: "Energy Efficiency",
      body: "Less A/C load means better fuel economy and a more comfortable ride from mile one.",
    },
  ],
  services: [
    {
      key: "tint" as const,
      name: "Window Tint",
      tag: "Signature Service",
      description:
        "Ceramic and carbon films engineered for maximum heat rejection, UV protection, and a flawless factory-look finish.",
      benefits: ["Ceramic IR heat rejection", "99% UV block", "Lifetime warranty", "Legal-tint consultation"],
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
      cta: "Get Tint Quote",
    },
    {
      key: "ceramic" as const,
      name: "Ceramic Coating",
      tag: "Premium Upgrade",
      description:
        "A hydrophobic, gloss-enhancing shield that protects paint from contaminants, UV, and swirl marks for years.",
      benefits: ["9H hardness", "Extreme gloss", "Hydrophobic finish", "2–7 year protection"],
      image:
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
      cta: "Add Ceramic",
    },
    {
      key: "ppf" as const,
      name: "Paint Protection Film",
      tag: "Ultimate Protection",
      description:
        "Self-healing polyurethane film that shields paint from rock chips, road debris, and scratches — invisibly.",
      benefits: ["Self-healing top-coat", "Rock chip protection", "10-year warranty", "Full & partial coverage"],
      image:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
      cta: "Explore PPF",
    },
    {
      key: "detail" as const,
      name: "Automotive Detailing",
      tag: "Restore & Refresh",
      description:
        "White-glove interior and exterior detailing. Correction, decon, and finishing for a truly premium result.",
      benefits: ["Paint correction", "Interior deep clean", "Leather conditioning", "Engine bay detail"],
      image:
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1400&q=80",
      cta: "Book Detail",
    },
  ],
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
      alt: "Dark sports car with tinted windows",
      caption: "35% Ceramic Tint · Sport Coupe",
    },
    {
      src: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1400&q=80",
      alt: "Luxury coupe with ceramic tint",
      caption: "20% Ceramic IR · Luxury Coupe",
    },
    {
      src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1400&q=80",
      alt: "Performance sedan detailed",
      caption: "5% Rear · Performance Sedan",
    },
    {
      src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80",
      alt: "American muscle car",
      caption: "Full Front PPF · American Muscle",
    },
    {
      src: "https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?auto=format&fit=crop&w=1400&q=80",
      alt: "Luxury SUV",
      caption: "Ceramic Coat + Tint · Luxury SUV",
    },
    {
      src: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1400&q=80",
      alt: "Modern sports car three quarter",
      caption: "Full Detail · Modern Sports Car",
    },
  ],
  // YouTube videos for the gallery page — add IDs as Angelo films content.
  // e.g. { youtubeId: "dQw4w9WgXcQ", title: "Full front PPF — time lapse" }
  videos: [] as { youtubeId: string; title: string }[],
  whyChoose: [
    { title: "Premium Films Only", body: "We install top-tier ceramic and carbon films — never the bargain stuff." },
    { title: "Certified Installers", body: "Factory-trained installers who treat every vehicle like their own." },
    { title: "Lifetime Warranty", body: "Every install is backed by a transferable lifetime manufacturer warranty." },
    { title: "Obsessive Detail", body: "Edge-to-edge precision. No gaps, no bubbles, no compromises." },
    { title: "Climate-Controlled Bay", body: "Dust-free, temperature-controlled install environment for perfect results." },
    { title: "Fast Turnaround", body: "Most vehicles complete same-day. We respect your time and your ride." },
  ],
  process: [
    { step: "01", title: "Request a Quote", body: "Tell us about your vehicle and goals — takes 60 seconds." },
    { step: "02", title: "Get a Recommendation", body: "We match you with the ideal film and shade for your needs." },
    { step: "03", title: "Book Your Appointment", body: "Pick a time that works. Same-week openings available." },
    { step: "04", title: "Professional Install", body: "White-glove installation in our climate-controlled bay." },
    { step: "05", title: "Enjoy Your Ride", body: "Drive away cooler, more protected, and turning more heads." },
  ],
  // Film tiers — backs up the "transparent flat-rate pricing" promise.
  // Prices are per full vehicle; swap per tenant.
  packages: [
    {
      name: "Carbon",
      tag: "Everyday Value",
      blurb: "Color-stable carbon film. A serious step up from dyed tint — no fading, no purple, solid heat rejection.",
      heatRejection: "Up to 62% total solar energy",
      warranty: "Lifetime",
      prices: [
        { vehicle: "Coupe / Sedan", price: "$249" },
        { vehicle: "SUV / Truck", price: "$299" },
        { vehicle: "Full Windshield", price: "+$149" },
      ],
      featured: false,
    },
    {
      name: "Ceramic",
      tag: "Most Popular",
      blurb: "Nano-ceramic construction that blocks dramatically more infrared heat. The sweet spot of comfort and price.",
      heatRejection: "Up to 88% infrared rejection",
      warranty: "Lifetime, transferable",
      prices: [
        { vehicle: "Coupe / Sedan", price: "$399" },
        { vehicle: "SUV / Truck", price: "$449" },
        { vehicle: "Full Windshield", price: "+$199" },
      ],
      featured: true,
    },
    {
      name: "Ceramic IR+",
      tag: "Flagship",
      blurb: "Our top-shelf multi-layer ceramic IR film. Maximum heat rejection physics allows in a legal shade.",
      heatRejection: "Up to 96% infrared rejection",
      warranty: "Lifetime, transferable",
      prices: [
        { vehicle: "Coupe / Sedan", price: "$549" },
        { vehicle: "SUV / Truck", price: "$599" },
        { vehicle: "Full Windshield", price: "+$249" },
      ],
      featured: false,
    },
  ],
  // Shade picker (VLT = visible light transmission; lower = darker).
  shades: [
    {
      vlt: 70,
      label: "70%",
      name: "Clear IR",
      body: "Nearly invisible. All the heat and UV rejection with a factory-glass look — the windshield-legal choice.",
    },
    {
      vlt: 50,
      label: "50%",
      name: "Light Smoke",
      body: "A subtle tint that cuts glare and heat without changing the car's character. Great for front windows.",
    },
    {
      vlt: 35,
      label: "35%",
      name: "Classic",
      body: "Our most popular shade. Noticeably sleek from outside, easy visibility from inside, legal in most states.",
    },
    {
      vlt: 20,
      label: "20%",
      name: "Deep",
      body: "Strong privacy with a clean, uniform factory-limo look. The go-to for rear windows on trucks and SUVs.",
    },
    {
      vlt: 5,
      label: "5%",
      name: "Limo",
      body: "Maximum privacy. Typically rear-windows-only to stay legal — we'll confirm your state's limits before install.",
    },
  ],
  // Real Google reviews (Google Business Profile, 5.0★ across 18 reviews)
  testimonials: [
    {
      name: "Eric Luchetti",
      vehicle: "",
      service: "Google Review",
      quote:
        "Great communication, fast service, excellent workmanship, and an awesome staff.",
      rating: 5,
    },
    {
      name: "J D",
      vehicle: "",
      service: "Google Review",
      quote: "Good dudes that do solid work for a reasonable price.",
      rating: 5,
    },
    {
      name: "Debi Smith",
      vehicle: "",
      service: "Google Review",
      quote:
        "Extremely happy with the finish and extra care taken with my new vehicle.",
      rating: 5,
    },
  ],
  faqs: [
    {
      q: "What tint percentage should I choose?",
      a: "It depends on your state's legal limit and your goals. Most drivers pick 20–35% on rear windows for privacy and 50–70% ceramic on fronts for heat rejection without darkness. We'll walk you through the perfect combo during your quote.",
    },
    {
      q: "Is my tint covered by warranty?",
      a: "Yes. Every premium film we install carries a transferable lifetime manufacturer warranty against bubbling, peeling, fading, and delamination.",
    },
    {
      q: "How long does installation take?",
      a: "A standard sedan takes about 2–3 hours. SUVs and trucks run 3–4 hours. PPF and ceramic coatings are typically 1–3 day services depending on coverage.",
    },
    {
      q: "What are the legal tint limits in my state?",
      a: "Tint laws vary by state and by window (front, rear, back). We stay up to date and will always recommend film that keeps you compliant.",
    },
    {
      q: "How much does professional tint cost?",
      a: "It depends on your vehicle and the film tier you choose. We quote a flat, all-in price up front from the details you send us — no hidden fees and no surprises at pickup. Send your vehicle info through the quote form and we'll get you an exact number.",
    },
    {
      q: "How soon can I book?",
      a: "We typically have same-week availability. Weekend slots book fast — reserve early for the best time.",
    },
  ],
};

export type Site = typeof site;
