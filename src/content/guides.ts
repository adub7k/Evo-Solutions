/**
 * The /guides SEO hub.
 *
 * Plain data, server-rendered — no CMS. To publish: add an entry (newest
 * first), push. Every guide must earn its place by answering the search
 * honestly and then linking to the service page that solves the problem.
 *
 * Copy rules are the same as everywhere else: no prices, no warranty claims,
 * no invented statistics, no "thousands of installs". Where a number would
 * help, describe what drives it instead of inventing one.
 */

export type Block =
  | { t: "p"; x: string }
  | { t: "h2"; x: string }
  | { t: "h3"; x: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; x: string }
  /** Inline link out to a service page — this is the conversion path. */
  | { t: "cta"; x: string; to: string; label: string };

export type Guide = {
  slug: string;
  title: string;
  /** Shorter label for nav and footer lists. */
  navTitle: string;
  description: string;
  /** ISO date; drives sort order and Article schema. */
  date: string;
  minutes: number;
  category: "Window Tint" | "Ceramic Coating" | "PPF" | "Detailing";
  /** Service page this guide should feed. */
  service: string;
  body: Block[];
};

export const guides: Guide[] = [
  {
    slug: "best-window-tint-for-albuquerque-heat",
    title: "The best window tint for Albuquerque heat",
    navTitle: "Best tint for ABQ heat",
    description:
      "Why darker film isn't cooler film, what actually rejects heat at 5,300 feet, and how to pick a shade you'll still be happy with in three summers.",
    date: "2026-08-18",
    minutes: 6,
    category: "Window Tint",
    service: "window-tint",
    body: [
      {
        t: "p",
        x: "Almost everyone who walks into the shop in July asks for the same thing: the darkest tint that's still legal. It's a reasonable instinct and it's usually the wrong purchase, because darkness and heat rejection are two different properties of a piece of film.",
      },
      { t: "h2", x: "Albuquerque is a harder case than most cities" },
      {
        t: "p",
        x: "The city sits at roughly 5,300 feet. There's less atmosphere overhead to absorb solar radiation, the sky is clear most of the year, and shade in a parking lot is a luxury. A car left out through an afternoon here soaks up more energy than the same car would at sea level under the same air temperature.",
      },
      {
        t: "p",
        x: "That's why people who move here from milder places are so surprised by their first summer. The thermometer says the low nineties. The steering wheel says something else entirely.",
      },
      { t: "h2", x: "Darkness is not the same as heat rejection" },
      {
        t: "p",
        x: "Visible light is only part of what the sun delivers. A large share of the heat you actually feel arrives as infrared, which your eyes can't see at all. A film can be very dark and still let infrared straight through — that's exactly what cheap dyed film does. It blocks the view and soaks up the heat.",
      },
      {
        t: "p",
        x: "Nano-ceramic films are built the other way round. The ceramic particles in the film are chosen to reject infrared specifically, which is why a light ceramic film can keep a cabin cooler than a much darker budget film. If heat is the problem you're solving, the film's construction matters more than the number on the shade.",
      },
      {
        t: "note",
        x: "A useful way to think about it: pick the shade for how you want the car to look and how much privacy you want. Pick the film tier for how hot the car gets.",
      },
      { t: "h2", x: "What we'd put on a car that lives outside" },
      {
        t: "p",
        x: "If the car parks outside at work all day, and especially if it's a dark colour, ceramic is worth the difference over carbon. The gap shows up in exactly the conditions that made you call — a car that's been baking since nine in the morning.",
      },
      {
        t: "p",
        x: "If the car is garaged, driven mostly at either end of the day, or you're solving glare rather than heat, carbon film is genuinely enough. We'd rather tell you that than sell you film you won't feel the benefit of.",
      },
      { t: "h2", x: "Don't forget the windshield" },
      {
        t: "p",
        x: "The windshield is the biggest piece of glass on the car and it faces the sun most directly. New Mexico only permits non-reflective film above the AS-1 line, but a clear or near-clear infrared film across the whole windshield is a legal option that makes a real difference to cabin temperature — without changing how the glass looks.",
      },
      { t: "h2", x: "Shades people actually settle on" },
      {
        t: "ul",
        items: [
          "70–50% — nearly invisible. Keeps the factory look, cuts glare, and with ceramic construction still rejects serious heat. The usual pick for windshields and for drivers who don't want a dark car.",
          "35% — noticeably sleek from outside, easy to see out of at night. The default recommendation for front side windows.",
          "20% — New Mexico's limit and a real privacy shade. Excellent on rear glass, particularly on trucks and SUVs. Reversing on an unlit street takes more trust in your camera.",
        ],
      },
      { t: "h2", x: "What tint won't fix" },
      {
        t: "p",
        x: "Film only works on the glass. Heat still comes through the roof, the doors and the floor, and a car with a weak air conditioning system will still struggle. Tint makes the cabin meaningfully cooler and makes the A/C's job much easier — it isn't a replacement for the A/C.",
      },
      {
        t: "cta",
        x: "Not sure which tier your car needs? Tell us how and where you park it and we'll give you a straight recommendation.",
        to: "/window-tint",
        label: "Get a window tint quote",
      },
    ],
  },
  {
    slug: "what-tint-percentage-should-i-get",
    title: "What tint percentage should you actually get?",
    navTitle: "Choosing a tint percentage",
    description:
      "20%, 35% or lighter? How to choose a tint shade you'll still be happy with in three years — legality, night visibility, heat and looks, weighed honestly.",
    date: "2026-08-16",
    minutes: 5,
    category: "Window Tint",
    service: "window-tint",
    body: [
      {
        t: "p",
        x: "The most common question in the shop isn't about price, it's \"how dark should I go?\" The honest answer is that the darkest legal option isn't automatically the right one.",
      },
      {
        t: "p",
        x: "New Mexico permits 20% VLT on the front sides, rear sides and rear window — darker than most states. But what's legal, what looks right on your car, and what's pleasant to live with at night are three separate questions.",
      },
      { t: "h2", x: "What VLT actually measures" },
      {
        t: "p",
        x: "VLT stands for visible light transmission: the percentage of visible light that makes it through. Lower number, darker window. The figure that matters legally is the glass and the film together, not the film on its own — which is why a 20% film on already-tinted factory glass can measure under the limit.",
      },
      { t: "h2", x: "The shades in practice" },
      { t: "h3", x: "70–50%" },
      {
        t: "p",
        x: "Nearly invisible. You keep the factory look and lose the glare, and with ceramic construction you still get serious heat rejection. This is the right answer for windshields and for anyone who doesn't want a dark-looking car.",
      },
      { t: "h3", x: "35%" },
      {
        t: "p",
        x: "The sweet spot for most daily drivers. Clearly tinted from outside, but at night you can still see your mirrors and what's behind you when reversing. If you're torn, this is the safe choice.",
      },
      { t: "h3", x: "20%" },
      {
        t: "p",
        x: "New Mexico's legal limit and a genuine privacy shade. It looks excellent on trucks and SUVs, particularly on rear glass. The trade-off is night visibility — backing out of an unlit driveway means trusting your camera more than your mirrors.",
      },
      { t: "h3", x: "5% (limo)" },
      {
        t: "p",
        x: "Belongs on rear glass of work trucks and family haulers where cargo privacy matters. We'll generally talk you out of it on front windows: it's outside the legal limit here and genuinely hard to see through at night.",
      },
      { t: "h2", x: "A combination that suits most people" },
      {
        t: "p",
        x: "Something lighter on the front sides and 20% behind the B-pillar satisfies more drivers long-term than any single shade across the car. You keep night visibility where you need it and get privacy where it counts.",
      },
      {
        t: "note",
        x: "Come by the shop and we'll hold real film samples against your own glass before you commit. It looks different on your car than it does on a sample board — and completely different at night.",
      },
      {
        t: "cta",
        x: "Want a recommendation per window rather than a guess?",
        to: "/window-tint",
        label: "Get a tint quote",
      },
    ],
  },
  {
    slug: "ceramic-vs-carbon-window-tint",
    title: "Ceramic vs carbon window tint: what the difference actually buys",
    navTitle: "Ceramic vs carbon tint",
    description:
      "Dyed, carbon and ceramic film explained without the sales pitch — how each is built, what fails first, and which one is worth it in New Mexico.",
    date: "2026-08-14",
    minutes: 6,
    category: "Window Tint",
    service: "window-tint",
    body: [
      {
        t: "p",
        x: "Two cars can leave a shop with what looks like identical 20% tint and have completely different experiences of the next five summers. The difference is what the film is made of.",
      },
      { t: "h2", x: "Dyed film" },
      {
        t: "p",
        x: "The cheapest construction: a layer of dye that absorbs light. It blocks the view and not much else, and the dye is not stable under sustained UV. In this climate dyed film is the stuff that goes purple, hazes over and starts bubbling — often inside a couple of summers.",
      },
      {
        t: "p",
        x: "We don't install it. If you've got film that's turning purple, that's what it is, and it's worth stripping properly rather than laying new film over the top.",
      },
      { t: "h2", x: "Carbon film" },
      {
        t: "p",
        x: "Carbon particles replace the dye. Because the colour comes from carbon rather than a pigment that breaks down, it stays stable — no purpling, no fading to brown. It has a clean matte-black look that a lot of people prefer to the slight gloss of cheaper film, and it rejects a solid amount of heat.",
      },
      {
        t: "p",
        x: "For a garage-kept car, or one that's mostly driven early and late, carbon is a genuinely good product and the value peak of the range.",
      },
      { t: "h2", x: "Ceramic film" },
      {
        t: "p",
        x: "Nano-ceramic particles are chosen for one job: rejecting infrared, the part of sunlight you feel as heat. That's what you're buying. At the same visible shade a ceramic film will keep a cabin cooler than a carbon one, and the gap is widest in exactly the conditions that made you look into tint — a car that's been sitting in the sun all day.",
      },
      {
        t: "p",
        x: "Ceramic is also non-metallic, so unlike older metallized films it won't interfere with phone signal, GPS, keyless entry or tyre pressure sensors.",
      },
      { t: "h2", x: "So which one?" },
      {
        t: "ul",
        items: [
          "Car parks outside all day, or it's black, or you regularly have people in the back — ceramic.",
          "Car is garaged and you're mostly solving glare and looks — carbon does the job.",
          "Anything cheaper than carbon — we'd rather you spent the money once.",
        ],
      },
      {
        t: "note",
        x: 'Beware of a shade number being used to imply performance. "5% ceramic" and "5% dyed" look the same from the pavement and are not the same product.',
      },
      {
        t: "cta",
        x: "We'll tell you plainly which tier is worth it for your car and how you use it.",
        to: "/window-tint",
        label: "Get a tint quote",
      },
    ],
  },
  {
    slug: "how-much-does-window-tint-cost-in-albuquerque",
    title: "What actually drives the cost of window tint in Albuquerque",
    navTitle: "What tint costs (and why)",
    description:
      "Our tint prices are published on the window tint page. Here's what sits behind those numbers, and how to compare two quotes fairly when they're hundreds apart.",
    date: "2026-08-12",
    minutes: 6,
    category: "Window Tint",
    service: "window-tint",
    body: [
      {
        t: "p",
        x: "Ring three shops for a quote on the same car and you can get three very different numbers. That's not necessarily anyone being dishonest — it usually means you're being quoted three different jobs. Here's what moves the price, so you can compare like for like.",
      },
      { t: "h2", x: "1. How much glass the car has" },
      {
        t: "p",
        x: "A two-door coupe and a three-row SUV are not the same job. More glass means more film and more labour, and large curved rear windows take significantly longer than flat door glass. This is why a quote given over the phone without knowing the exact model is a guess.",
      },
      { t: "h2", x: "2. Film tier" },
      {
        t: "p",
        x: "The single biggest lever. Dyed, carbon and ceramic films differ substantially in cost, and ceramic is where most of the price gap between quotes comes from. If one quote is dramatically cheaper, the first question to ask is what film it's for.",
      },
      { t: "h2", x: "3. Removing old film" },
      {
        t: "p",
        x: "Stripping failed tint is real labour, especially on rear glass, where the defroster lines have to survive the process. Some quotes include removal and some quietly don't. Ask.",
      },
      { t: "h2", x: "4. Windshield and roof glass" },
      {
        t: "p",
        x: "A full windshield film or a panoramic roof is a separate line item, not part of a standard all-round quote. Both are worth considering in this climate — just make sure you know whether a quote includes them.",
      },
      { t: "h2", x: "5. How the job is actually done" },
      {
        t: "p",
        x: "Film cut to the vehicle's pattern rather than trimmed with a blade on your glass. Proper decontamination before anything is laid. Edges finished so they don't lift. None of this is visible in a quote and all of it is the difference between film that lasts and film you're paying to remove in two years.",
      },
      { t: "h2", x: "How to compare quotes fairly" },
      {
        t: "ol",
        items: [
          "Confirm the exact film tier — not just the shade percentage.",
          "Confirm which windows are included, and whether the windshield is one of them.",
          "Confirm whether removing existing film is in the price.",
          "Ask what the warranty covers and get it in writing.",
          "Ask to see the shop's own work on a car like yours.",
        ],
      },
      {
        t: "note",
        x: "We quote a flat number for your specific vehicle once we know what it is and what you want — not a range, and not a price that changes at pickup.",
      },
      {
        t: "cta",
        x: "Send us the year, make and model and what's bothering you. You'll get a real number, not a range.",
        to: "/quote",
        label: "Get my free quote",
      },
    ],
  },
  {
    slug: "how-long-does-window-tint-take-to-cure",
    title: "How long tint takes — and what the haze afterwards means",
    navTitle: "Tint curing explained",
    description:
      "What happens on install day, why your new tint looks hazy or bubbled at first, and how long to wait before rolling the windows down.",
    date: "2026-08-10",
    minutes: 4,
    category: "Window Tint",
    service: "window-tint",
    body: [
      {
        t: "p",
        x: "Two questions come up at pickup more than any others: how long did that take, and why does it look like there's water under my back window. Here's both answers.",
      },
      { t: "h2", x: "Install day" },
      {
        t: "p",
        x: "How long the car is with us depends on the vehicle and how much glass it has. Most of the work isn't laying the film — it's preparing the glass. Anything left on the glass ends up trapped under the film permanently, so the cleaning stage is not the place to save time.",
      },
      {
        t: "p",
        x: "We'll give you a realistic window when you book, and we'd rather quote you honest hours than rush a rear window.",
      },
      { t: "h2", x: "Why it looks hazy at first" },
      {
        t: "p",
        x: "Film is applied with a water-based solution. A thin layer of that moisture stays between the film and the glass when you drive away, and it has to evaporate out through the film. While it does, you'll see haze, cloudiness, or small pockets that look like bubbles or water blisters.",
      },
      {
        t: "p",
        x: "That's normal, it's not a fault, and it clears on its own. Small pockets on rear glass are the last to go.",
      },
      { t: "h2", x: "Don't roll the windows down" },
      {
        t: "p",
        x: "This is the one that matters. Until the film has bonded, running a window down can drag the edge of the film out of position. A few days is the safe answer, and longer in cold weather — curing is slower when it's cold.",
      },
      {
        t: "note",
        x: "Cold weather slows curing considerably. A winter install can take noticeably longer to clear than the same car in July.",
      },
      { t: "h2", x: "How to clean it afterwards" },
      {
        t: "ul",
        items: [
          "Wait until the film has fully cured before cleaning the inside of the glass.",
          "Use an ammonia-free cleaner. Ammonia breaks down the film's adhesive and is what turns tint purple and hazy over time.",
          "Use a soft microfibre, not paper towel or anything abrasive.",
          "Be careful along the top edge when the window is down — that edge is the vulnerable one.",
        ],
      },
      {
        t: "cta",
        x: "Any concerns while it's curing, bring it back and we'll look at it.",
        to: "/window-tint",
        label: "See our window tint service",
      },
    ],
  },
  {
    slug: "is-ceramic-coating-worth-it-in-new-mexico",
    title: "Is ceramic coating worth it in New Mexico?",
    navTitle: "Is coating worth it here?",
    description:
      "An honest look at what a ceramic coating does and doesn't do, and why the high desert is a stronger case for one than most of the country.",
    date: "2026-08-08",
    minutes: 6,
    category: "Ceramic Coating",
    service: "ceramic-coating",
    body: [
      {
        t: "p",
        x: "Ceramic coating is probably the most oversold product in this industry. It's also genuinely useful, and New Mexico is one of the better arguments for it. Both of those things are true, so here's the version without the marketing.",
      },
      { t: "h2", x: "What a coating actually is" },
      {
        t: "p",
        x: "A liquid that chemically bonds to your clear coat and cures into a hard, slick, semi-permanent layer. Unlike wax, which sits on top and washes away in weeks, a coating is attached and is measured in years.",
      },
      { t: "h2", x: "What it genuinely does" },
      {
        t: "ul",
        items: [
          "Makes the car dramatically easier to wash — dirt and water release instead of clinging.",
          "Adds real gloss and depth on top of properly corrected paint.",
          "Resists UV oxidation, which is what turns older red and black paint chalky.",
          "Resists chemical staining from bird droppings, bugs, sap and hard-water minerals.",
          "Gives you far more time to remove something before it etches the clear coat.",
        ],
      },
      { t: "h2", x: "What it does not do" },
      {
        t: "ul",
        items: [
          "Stop rock chips. Nothing chemical will — that's paint protection film's job.",
          "Make paint scratch-proof. Automatic car wash brushes will still mar a coated car.",
          "Mean you never wash the car again.",
          "Fix paint that wasn't corrected first. It locks in whatever is underneath it.",
        ],
      },
      { t: "h2", x: "Why New Mexico is a strong case" },
      {
        t: "p",
        x: "The two things a coating is best at are the two things working hardest on paint here. UV at 5,300 feet under a mostly clear sky is relentless, and Albuquerque's water is hard — let it dry on a hot panel from a sprinkler or a hose and the minerals etch in. A coating buys you time and makes the spots release rather than bond.",
      },
      {
        t: "p",
        x: "Add late-summer monsoon dust settling on wet paint and you have a city that's tough on clear coat all year round.",
      },
      { t: "h2", x: "Why the prep costs more than the coating" },
      {
        t: "p",
        x: "This is the part worth understanding before you buy. A coating is optically clear and it seals in whatever is under it. Applied over swirl marks, it makes the swirls permanent and glossy. The polishing stage is where the result actually comes from — the bottle is the easy part, and any shop quoting a coating without discussing correction is quoting you a different product.",
      },
      { t: "h2", x: "So is it worth it?" },
      {
        t: "p",
        x: "If the car lives outside, if you keep your cars a long time, or if you simply hate washing — yes, comfortably. If the car is garaged, you're selling it next year, and you're fine with a wax twice a year, it's a harder argument and we'll say so.",
      },
      {
        t: "cta",
        x: "Send us photos of the paint and we'll tell you what correction it needs before we quote a coating.",
        to: "/ceramic-coating",
        label: "Get a coating quote",
      },
    ],
  },
  {
    slug: "ceramic-coating-vs-wax-vs-sealant",
    title: "Ceramic coating vs wax vs sealant",
    navTitle: "Coating vs wax vs sealant",
    description:
      "Three products that all make paint shiny and behave completely differently. How long each lasts, what each protects against, and which is right for your car.",
    date: "2026-08-06",
    minutes: 5,
    category: "Ceramic Coating",
    service: "ceramic-coating",
    body: [
      {
        t: "p",
        x: "All three make a car glossy on the day. The differences show up two months later.",
      },
      { t: "h2", x: "Carnauba wax" },
      {
        t: "p",
        x: "A natural product that sits on top of the paint. It gives a warm, deep glow that a lot of enthusiasts prefer on dark colours, it's cheap, and anyone can apply it in an afternoon. It also melts. In an Albuquerque summer, wax on a car parked outside is measured in weeks.",
      },
      { t: "h2", x: "Synthetic sealant" },
      {
        t: "p",
        x: "A polymer that bonds more effectively than wax and lasts several months rather than several weeks. It handles heat better and sheds water well. A good middle option for someone who wants protection without committing to a coating.",
      },
      { t: "h2", x: "Ceramic coating" },
      {
        t: "p",
        x: "Chemically bonds to the clear coat and cures hard. Measured in years, not months. Much more resistant to UV, chemicals and hard-water etching than either of the above, and considerably slicker — which is what makes washing so much faster.",
      },
      { t: "h2", x: "Side by side" },
      {
        t: "ul",
        items: [
          "Longevity — wax: weeks. Sealant: months. Coating: years.",
          "Heat tolerance — wax is the weakest by a distance, which matters here.",
          "Chemical resistance — coating clearly ahead; it's the main reason to buy one.",
          "Ease of washing — coating, and it isn't close.",
          "Cost and effort — wax is cheapest and needs redoing constantly; a coating is a one-off with proper prep behind it.",
          "Scratch protection — none of them. That's what paint protection film is for.",
        ],
      },
      {
        t: "note",
        x: "Any of the three applied over swirled paint will make the swirls glossier. Correction first, protection second — in that order, whichever product you choose.",
      },
      {
        t: "cta",
        x: "Not sure which your car needs? Tell us how it's stored and how often you wash it.",
        to: "/ceramic-coating",
        label: "Talk to us about coating",
      },
    ],
  },
  {
    slug: "ppf-vs-ceramic-coating",
    title: "PPF vs ceramic coating: which one do you actually need?",
    navTitle: "PPF vs ceramic coating",
    description:
      "They're not competing products — they solve different problems. A straight comparison of what film protects against, what coating protects against, and when to do both.",
    date: "2026-08-04",
    minutes: 5,
    category: "PPF",
    service: "paint-protection-film",
    body: [
      {
        t: "p",
        x: "This is the most common point of confusion we deal with, and it's an expensive one to get wrong. The short version: film handles physical damage, coating handles chemical damage. They're complementary, not alternatives.",
      },
      { t: "h2", x: "Paint protection film" },
      {
        t: "p",
        x: "A clear urethane layer, roughly the thickness of a business card, applied over painted panels. It's thick and elastic, so a stone that would have chipped paint gets absorbed instead. Modern film also self-heals — light scratches in it close up with heat.",
      },
      {
        t: "p",
        x: "What it protects against: rock chips, road debris, sand and grit, light scratches, bug and tar etching.",
      },
      { t: "h2", x: "Ceramic coating" },
      {
        t: "p",
        x: "A hard, chemically bonded layer measured in microns. Far too thin to stop an impact, but very effective against everything chemical — UV, oxidation, water spots, bird droppings, industrial fallout.",
      },
      {
        t: "p",
        x: "What it protects against: sun damage, staining, etching, and the general effort of keeping a car clean.",
      },
      { t: "h2", x: "How to decide" },
      {
        t: "ul",
        items: [
          "You commute on I-25 or I-40 and the front bumper is getting peppered — you need film. No coating will help.",
          "The car lives outside and the paint is going dull, or hard water is spotting it — you need a coating.",
          "New car you intend to keep — film on the front end, coating over everything. This is the combination most people end up at.",
          "Older car with existing chips — talk about correcting the front end first, because film seals in whatever is under it.",
        ],
      },
      { t: "h2", x: "Doing both" },
      {
        t: "p",
        x: "Coating over film is the strongest setup available. The film takes the impacts, and the coating keeps the film slick, easier to clean and better protected from staining. Done in one visit it's also less time without the car, and the prep only gets paid for once.",
      },
      {
        t: "cta",
        x: "Tell us how you drive it and we'll tell you which one solves your actual problem.",
        to: "/paint-protection-film",
        label: "Get a PPF quote",
      },
    ],
  },
  {
    slug: "what-does-paint-protection-film-protect",
    title: "What paint protection film actually protects — and where to put it",
    navTitle: "What PPF protects",
    description:
      "Which panels get hit, why front ends age first, and how to choose between partial front, full front and full body coverage without overbuying.",
    date: "2026-08-02",
    minutes: 5,
    category: "PPF",
    service: "paint-protection-film",
    body: [
      {
        t: "p",
        x: "Damage on a car is not randomly distributed. Look at any five-year-old vehicle in this city and the chips are in the same handful of places, because it's physics — the panels facing forward take everything the road throws up.",
      },
      { t: "h2", x: "Where the damage lands" },
      {
        t: "ul",
        items: [
          "Front bumper — takes the most, by a wide margin.",
          "Leading edge of the hood — the first few inches catch almost everything that clears the bumper.",
          "Mirrors — small, exposed, and expensive to repaint.",
          "Headlights — chips and sandblasting haze the lens, which is a safety issue as well as a cosmetic one.",
          "A-pillars and roof leading edge — highway miles at speed.",
          "Rocker panels and behind the front wheels — everything the front tyres throw backwards.",
        ],
      },
      { t: "h2", x: "Why Albuquerque is hard on front ends" },
      {
        t: "p",
        x: "I-25 and I-40 carry constant construction traffic and gravel haulers. At highway speed a stone off the truck ahead of you has more than enough energy to go through clear coat and into primer. And a chip that reaches metal isn't cosmetic any more — water gets under the edge of the paint and it starts lifting from underneath.",
      },
      { t: "h2", x: "Choosing coverage" },
      { t: "h3", x: "Partial front" },
      {
        t: "p",
        x: "Bumper, the leading section of the hood, and the mirrors. Covers where most chips land at the lowest cost. The trade-off is a film edge across the hood, which is visible up close on some colours.",
      },
      { t: "h3", x: "Full front" },
      {
        t: "p",
        x: "Whole hood, whole bumper, both front fenders, mirrors. No line across the hood and everything facing forward is covered. This is what most people choose and what actually solves the problem.",
      },
      { t: "h3", x: "Extended and full body" },
      {
        t: "p",
        x: "Adds rockers, A-pillars and the roof's leading edge, up to every painted panel. Worth it on cars doing serious highway miles, and on anything you intend to keep for a long time.",
      },
      {
        t: "note",
        x: "You do not need full body coverage to solve a rock chip problem. We'll walk the car with you and point at what's actually getting hit before quoting anything.",
      },
      { t: "h2", x: "What film won't do" },
      {
        t: "p",
        x: "It won't help in a collision, it won't stop a door ding in a car park, and it isn't a substitute for a coating's chemical resistance. It also can't hide existing damage — chips under film stay visible and get sealed in, so damaged paint is worth addressing first.",
      },
      {
        t: "cta",
        x: "Send us photos of your front end and we'll quote the coverage that fits.",
        to: "/paint-protection-film",
        label: "Get a PPF quote",
      },
    ],
  },
  {
    slug: "how-often-should-you-detail-your-car",
    title: "How often should you detail your car in the high desert?",
    navTitle: "How often to detail",
    description:
      "Dust, sun and hard water change the maths on detailing in Albuquerque. A realistic schedule for daily drivers, work trucks and cars you actually care about.",
    date: "2026-07-30",
    minutes: 5,
    category: "Detailing",
    service: "auto-detailing",
    body: [
      {
        t: "p",
        x: "Advice written for a mild, wet climate doesn't transfer here. Albuquerque is dry, dusty and extremely sunny, which changes both what goes wrong and how often you need to deal with it.",
      },
      { t: "h2", x: "What's working against you here" },
      {
        t: "ul",
        items: [
          "Fine dust that gets into vents, seams, seat rails and every gap in the console.",
          "UV that dulls dashboards and fades door cards faster than most of the country.",
          "Hard water that etches into paint if it dries on a hot panel.",
          "Monsoon dust settling onto wet paint in late summer — the single easiest way to scratch a car is wiping that off dry.",
        ],
      },
      { t: "h2", x: "A realistic schedule" },
      { t: "h3", x: "Daily driver, parked outside" },
      {
        t: "p",
        x: "A proper interior detail twice a year keeps dust out of the places a vacuum can't reach and stops the dashboard going grey. Exterior decontamination and a machine polish roughly once a year keeps the paint from accumulating swirls permanently.",
      },
      { t: "h3", x: "Garaged car you care about" },
      {
        t: "p",
        x: "Once a year is usually plenty, especially if it's coated. The point is the decontamination — removing embedded fallout that regular washing leaves behind.",
      },
      { t: "h3", x: "Work truck or job-site vehicle" },
      {
        t: "p",
        x: "Interior every three to four months if it's carrying tools, dust and food. It's less about appearance and more about the interior not degrading — grit in the seat fabric acts like sandpaper every time you sit down.",
      },
      { t: "h3", x: "Before selling" },
      {
        t: "p",
        x: "One full detail, always. It's the highest-return day of work you can put into a car you're about to list. A corrected, properly cleaned car photographs better and changes what people offer before they've driven it.",
      },
      { t: "h2", x: "What you can do in between" },
      {
        t: "ul",
        items: [
          "Hand wash or touchless. Avoid the spinning brushes — that haze under the gas station canopy is thousands of small scratches.",
          "Never dry-wipe dust off paint. Rinse first, always.",
          "Don't let hard water dry on hot panels. Dry it off rather than letting it evaporate.",
          "A windscreen sunshade does more for a dashboard than any dressing.",
        ],
      },
      {
        t: "cta",
        x: "Tell us the condition it's in — photos get you a far more accurate quote.",
        to: "/auto-detailing",
        label: "Get a detailing quote",
      },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);

export const guidesByCategory = (category: Guide["category"]) =>
  guides.filter((g) => g.category === category);

/** Guides that feed a given service page, for cross-linking. */
export const guidesForService = (serviceSlug: string) =>
  guides.filter((g) => g.service === serviceSlug);
