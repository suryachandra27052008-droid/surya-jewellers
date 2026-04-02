export interface Section {
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'subheading' | 'table';
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  excerpt: string;
  readTime: string;
  date: string;
  pinned?: boolean;
  content: Section[];
}

export const posts: BlogPost[] = [
  {
    slug: 'size-guide',
    category: 'Size Guide',
    title: 'Ring & Bracelet Size Guide',
    subtitle: 'Find your perfect fit — Indian and US ring sizes, bracelet sizing, and a simple at-home measuring guide',
    excerpt:
      'Not sure of your ring size? Use our complete size chart covering Indian sizes, US equivalents, and inner diameter in mm — plus a simple paper-strip method you can do at home in two minutes.',
    readTime: '3 min read',
    date: 'Pinned',
    pinned: true,
    content: [
      {
        type: 'paragraph',
        text: 'Getting the right size before you order makes all the difference. Use the chart and instructions below — and if you are still unsure, reach out to us directly before placing your order.',
      },
      {
        type: 'heading',
        text: 'Ring Size Chart',
      },
      {
        type: 'paragraph',
        text: 'Find your Indian ring size using the inner diameter of a ring that already fits well, or follow the measuring guide below.',
      },
      {
        type: 'table',
        headers: ['Indian Size', 'US Size', 'Diameter (mm)'],
        rows: [
          ['6',  '3',    '14.1'],
          ['7',  '3½',   '14.5'],
          ['8',  '4',    '14.9'],
          ['9',  '4½',   '15.3'],
          ['10', '5',    '15.7'],
          ['11', '5½',   '16.1'],
          ['12', '6',    '16.5'],
          ['13', '6½',   '16.9'],
          ['14', '7',    '17.3'],
          ['15', '7½',   '17.7'],
          ['16', '8',    '18.1'],
          ['17', '8½',   '18.5'],
          ['18', '9',    '18.9'],
          ['19', '9½',   '19.3'],
          ['20', '10',   '19.7'],
          ['21', '10½',  '20.1'],
          ['22', '11',   '20.5'],
          ['23', '11½',  '20.9'],
          ['24', '12',   '21.3'],
          ['25', '12½',  '21.7'],
        ],
      },
      {
        type: 'quote',
        text: 'If you are between sizes, we recommend sizing up for comfort.',
      },
      {
        type: 'heading',
        text: 'Bracelet Size',
      },
      {
        type: 'paragraph',
        text: 'All Surya Jewellers bracelets are crafted in a standard length of 17–18 cm, designed to fit most wrists with a comfortable, elegant drape. If you have a specific wrist size requirement, please reach out to us for a custom order.',
      },
      {
        type: 'quote',
        text: 'Tip: Measure your wrist snugly with a tape measure, then add 1–2 cm for the ideal bracelet length.',
      },
      {
        type: 'heading',
        text: 'How to Measure Your Ring Size at Home',
      },
      {
        type: 'paragraph',
        text: 'All you need is a thin strip of paper and a ruler. Follow these five steps:',
      },
      {
        type: 'list',
        items: [
          'Cut a thin strip of paper about 1 cm wide and long enough to wrap around your finger.',
          'Wrap it snugly around the base of the finger you plan to wear the ring on — not too tight.',
          'Mark where the paper overlaps with a pen. This is the inner circumference.',
          'Lay the paper flat and measure the marked length in millimetres. Divide by 3.14 to get your inner diameter.',
          'Find the closest diameter value in the chart above to get your Indian ring size.',
        ],
      },
      {
        type: 'subheading',
        text: 'Pro Tips',
      },
      {
        type: 'list',
        items: [
          'Measure at the end of the day — fingers are slightly larger then and this gives you the most accurate fit.',
          'Avoid measuring when your hands are cold, as fingers shrink in cold temperatures.',
          'If your knuckle is wider than the base of your finger, size up so the ring can pass over comfortably.',
        ],
      },
    ],
  },
  {
    slug: 'care-for-sterling-silver',
    category: 'Care & Maintenance',
    title: 'How to Care for 92.5 Sterling Silver Jewellery',
    subtitle: 'A complete guide to keeping your silver pieces radiant for a lifetime',
    excerpt:
      'Sterling silver is a living metal — it breathes, reacts, and over time tells the story of the hands that wore it. With the right care, your 92.5 silver pieces will only grow more beautiful.',
    readTime: '5 min read',
    date: 'March 2025',
    content: [
      {
        type: 'paragraph',
        text: 'Sterling silver — marked 92.5 for its 92.5% pure silver content — is among the most beloved metals in fine jewellery. At Surya Jewellers, every piece we craft begins with this noble alloy, chosen for its luminous sheen, workability, and the way it catches light unlike any other material.',
      },
      {
        type: 'paragraph',
        text: 'But silver is also a reactive metal. Exposure to air, moisture, and certain chemicals causes a natural process called tarnishing — a darkening of the surface. This is not damage. It is chemistry. And with the right knowledge, it is entirely manageable.',
      },
      {
        type: 'heading',
        text: 'Why Does Silver Tarnish?',
      },
      {
        type: 'paragraph',
        text: 'The copper alloy in 92.5 sterling silver reacts with sulfur compounds present in air, sweat, and common household products. The result is silver sulfide — that familiar dark patina. Humidity accelerates this process, which is why your jewellery stored in a bathroom tarnishes faster than a piece kept in a dry drawer.',
      },
      {
        type: 'heading',
        text: 'Daily Wear Habits That Make a Difference',
      },
      {
        type: 'list',
        items: [
          'Put jewellery on last — after perfume, lotions, and hairspray have dried completely. Chemicals in these products accelerate tarnishing and can dull gemstones.',
          'Remove your silver before swimming. Chlorine in pools and salt in the sea are particularly harsh on sterling silver.',
          'Take off pieces before sleeping or exercising. Sweat and friction work against the metal over time.',
          'Avoid direct contact with rubber, latex, and wool — all contain sulfur compounds.',
        ],
      },
      {
        type: 'heading',
        text: 'Cleaning Your Silver at Home',
      },
      {
        type: 'paragraph',
        text: 'For regular cleaning, a soft microfibre cloth is all you need. Gently rub the surface in long strokes — not circular — following the grain of the metal. This restores shine without scratching.',
      },
      {
        type: 'paragraph',
        text: 'For a deeper clean on pieces without gemstones, mix a few drops of mild dish soap in warm water. Use a soft-bristled toothbrush to clean intricate details, rinse thoroughly, and pat dry immediately. Never leave silver wet.',
      },
      {
        type: 'quote',
        text: 'Never use toothpaste on silver. Despite popular advice, it is mildly abrasive and will scratch the surface over time.',
      },
      {
        type: 'heading',
        text: 'Caring for Silver Set with Gemstones',
      },
      {
        type: 'paragraph',
        text: 'At Surya Jewellers, our silver is almost always adorned with natural diamonds, rubies, emeralds, or sapphires. These stones require their own consideration. Avoid ultrasonic cleaners unless you are certain the stones are set securely, and steer clear of harsh chemicals entirely. A damp soft cloth for the metal and a dry brush for the stones is the safest approach.',
      },
      {
        type: 'heading',
        text: 'Proper Storage',
      },
      {
        type: 'list',
        items: [
          'Store each piece in an individual soft pouch or compartment to prevent scratching.',
          'Anti-tarnish strips inside your jewellery box absorb sulfur compounds and dramatically slow tarnishing.',
          'Keep pieces in a cool, dry place away from direct sunlight.',
          'Zip-lock bags work surprisingly well — the airtight seal limits oxidation.',
        ],
      },
      {
        type: 'heading',
        text: 'Professional Cleaning',
      },
      {
        type: 'paragraph',
        text: 'Once or twice a year, bring your Surya Jewellers pieces in for a professional clean and inspection. We check stone settings, polish the metal, and return your jewellery looking as it did on day one. This service is a small investment that protects a lifetime of value.',
      },
      {
        type: 'paragraph',
        text: 'Silver is not fragile — it is forgiving. Treat it with attention and it will reward you with a beauty that only deepens with the years.',
      },
    ],
  },
  {
    slug: 'guide-to-natural-gemstones',
    category: 'Education',
    title: 'A Guide to Natural Gemstones — Diamonds, Rubies, Emeralds & Sapphires',
    subtitle: 'Understanding the stones that make fine jewellery truly precious',
    excerpt:
      'Every gemstone carries within it millions of years of the Earth\'s history. Before you choose a piece of jewellery, know the stone it holds — its character, its rarity, and what makes it worth treasuring.',
    readTime: '7 min read',
    date: 'February 2025',
    content: [
      {
        type: 'paragraph',
        text: 'At Surya Jewellers, we have a firm principle: no synthetic stones. Every gemstone set into our 92.5 sterling silver is natural — formed over millennia in the geological crucible of the Earth. This matters, not merely as a point of pride, but because it determines a stone\'s character, its energy, and its lasting value.',
      },
      {
        type: 'paragraph',
        text: 'Here is what you should know about the four precious stones we work with most.',
      },
      {
        type: 'heading',
        text: 'Diamonds — The Standard of All Brilliance',
      },
      {
        type: 'paragraph',
        text: 'The hardest natural substance on Earth (10 on the Mohs scale), a diamond is pure crystallised carbon formed under extreme pressure and heat, typically 100 miles below the Earth\'s surface. Its brilliance — the way it splits white light into a spectrum of colour — comes from its extraordinary refractive index.',
      },
      {
        type: 'subheading',
        text: 'The Four Cs',
      },
      {
        type: 'list',
        items: [
          'Cut — The most important factor for brilliance. A well-cut diamond will outshine a larger, poorly-cut one every time.',
          'Colour — Graded D (colourless, rarest) through Z. Colourless stones allow the purest light transmission.',
          'Clarity — Natural inclusions (internal characteristics) are the fingerprints of a natural diamond. Fewer inclusions mean higher clarity.',
          'Carat — The weight of the stone. One carat equals 0.2 grams.',
        ],
      },
      {
        type: 'paragraph',
        text: 'At Surya Jewellers, we select natural diamonds with attention to cut above all else — a beautifully cut smaller stone will always look more alive than a large dull one.',
      },
      {
        type: 'heading',
        text: 'Rubies — Fire and Passion in Crystalline Form',
      },
      {
        type: 'paragraph',
        text: 'A ruby is a red corundum (aluminium oxide), coloured by trace amounts of chromium. The finest rubies in the world come from Burma (Myanmar), and their coveted "pigeon blood" colour — a pure, vivid red with a hint of blue — commands prices that rival even diamonds.',
      },
      {
        type: 'paragraph',
        text: 'Rubies score 9 on the Mohs hardness scale, making them excellent for everyday jewellery. Natural rubies almost always contain inclusions — a perfectly "clean" ruby at a very low price is a red flag for synthetics or glass-filled stones.',
      },
      {
        type: 'quote',
        text: 'In Sanskrit, ruby is "ratnaraj" — the king of precious stones. In every culture, it has symbolised passion, protection, and nobility.',
      },
      {
        type: 'heading',
        text: 'Emeralds — The Green of Living Things',
      },
      {
        type: 'paragraph',
        text: 'Emeralds are a variety of beryl coloured by trace amounts of chromium and vanadium. Their characteristic lush green is unlike anything else in the natural world — it is the green of deep forest canopies and still mountain lakes.',
      },
      {
        type: 'paragraph',
        text: 'Colombia produces the world\'s finest emeralds. Unlike diamonds, inclusions in emeralds (called "jardin" — the French word for garden) are accepted and even considered part of the stone\'s character. An emerald without any inclusions is so rare as to be suspicious.',
      },
      {
        type: 'paragraph',
        text: 'Emeralds are softer than rubies and diamonds (7.5–8 on Mohs) and require more care. Avoid ultrasonic cleaners, sudden temperature changes, and hard blows.',
      },
      {
        type: 'heading',
        text: 'Sapphires — The Calm Depth of the Sky',
      },
      {
        type: 'paragraph',
        text: 'Sapphires are corundum — the same mineral family as rubies — coloured by iron and titanium. While we think of sapphires as blue, they come in every colour except red (which is, by definition, a ruby). The most prized are the "cornflower blue" sapphires of Kashmir and the "royal blue" of Sri Lanka.',
      },
      {
        type: 'paragraph',
        text: 'At 9 on the Mohs scale, sapphires are the second hardest gemstone after diamonds, making them ideal for rings and bracelets that endure daily wear.',
      },
      {
        type: 'heading',
        text: 'How to Tell Natural from Synthetic',
      },
      {
        type: 'list',
        items: [
          'Natural stones have inclusions. Perfection at a low price point is almost always synthetic.',
          'Always ask for a gemstone certificate from a recognised lab (GIA, IGI, or equivalent).',
          'Synthetic stones have a "too perfect" colour — uniformly vivid with no variation.',
          'Buy from jewellers who are transparent about their sourcing. We are.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Every gemstone at Surya Jewellers is natural. It is not a marketing claim — it is the foundation of everything we make.',
      },
    ],
  },
  {
    slug: 'jaipur-workshop-behind-scenes',
    category: 'Our Story',
    title: 'Behind the Scenes: Our Jaipur Workshop & the One Piece, One Design Philosophy',
    subtitle: 'A journey into the studio where each piece of Surya Jewellery is born',
    excerpt:
      'Step into our workshop on the edge of Jaipur\'s old city, where morning light falls across workbenches worn smooth by decades of craft, and where 90% of what we create exists as a single piece — never to be replicated.',
    readTime: '6 min read',
    date: 'January 2025',
    content: [
      {
        type: 'paragraph',
        text: 'Jaipur has been the capital of Indian gemstone cutting and jewellery making for over five centuries. The city\'s artisans — called "karigars" — carry inherited knowledge that no school teaches, passed from hand to hand across generations. It is into this tradition that Surya Jewellers was born, and from which we draw our identity.',
      },
      {
        type: 'heading',
        text: 'The Workshop',
      },
      {
        type: 'paragraph',
        text: 'Our studio sits in Anandpuri, a quiet neighbourhood in Jaipur. From the outside, it is unremarkable. Inside, the air carries the faint metallic scent of silver and the sound of small hammers working in careful rhythm. Natural light, when possible — our craftsmen prefer it. The eye sees colour and detail most honestly in sunlight.',
      },
      {
        type: 'paragraph',
        text: 'The space is divided by discipline. One corner belongs to the silversmith — the karigar who shapes and solders the metal. Another to the setter, who works under magnification to place each stone with precision that tolerates no error. A third to the polisher, who brings the final piece to its mirror finish through a process that takes longer than most people imagine.',
      },
      {
        type: 'heading',
        text: 'How a Piece is Born',
      },
      {
        type: 'paragraph',
        text: 'It begins with a sketch. Our founder Sanjay Chandra — who has been drawing jewellery since before he could properly write — creates the initial design. Sometimes it starts from a stone: a particular ruby whose shape suggests a specific setting. Sometimes it starts from an idea: the silhouette of a leaf, the geometry of a Rajasthani jali screen, the curve of a crescent moon.',
      },
      {
        type: 'paragraph',
        text: 'From the sketch, a wax model is carved. This is where the design becomes three-dimensional — and where you discover what works and what does not. The wax is held, worn, examined in light from different angles. Changes are made. The model is refined.',
      },
      {
        type: 'paragraph',
        text: 'Once the wax is approved, it is cast in silver using the lost-wax casting method — a technique used in India for over four thousand years. The silver is melted, poured, cooled. The rough casting is cleaned and filed. Then the real work begins.',
      },
      {
        type: 'heading',
        text: 'The One Piece, One Design Philosophy',
      },
      {
        type: 'quote',
        text: '"We do not build collections and replicate them. We build one piece, photograph it, and it is gone into the world. The next piece will be something else entirely."',
      },
      {
        type: 'paragraph',
        text: 'This is the principle that defines Surya Jewellers. Approximately 90% of our designs are created as a single piece — they are not produced in multiples. When you purchase a Surya Jewellers piece, you are not buying one of a thousand. You are buying the piece.',
      },
      {
        type: 'paragraph',
        text: 'This approach is unusual in the jewellery industry, where efficiency and scalability are the dominant logic. For us, it is an ethical and artistic commitment. Mass production demands compromise — at the material level, at the craft level, at the design level. We are not willing to make those compromises.',
      },
      {
        type: 'heading',
        text: 'The Karigars',
      },
      {
        type: 'paragraph',
        text: 'The heart of Surya Jewellers is not the designs or even the materials — it is the people who make the pieces. Our karigars have worked with us for years. They know our standards. They share our obsessions. When a setting is slightly off-centre by a fraction of a millimetre, they redo it. Not because we insist. Because they cannot live with it otherwise.',
      },
      {
        type: 'list',
        items: [
          'Our silversmiths are trained in traditional Jaipur silversmithing techniques alongside contemporary casting methods.',
          'Stone setters work under 10x magnification for precision placement of diamonds and gemstones.',
          'Every finished piece goes through a quality check against the original design sketch before it leaves the workshop.',
          'We participate in international jewellery shows — Hong Kong, Bangkok, Europe — bringing Jaipur\'s craft to the global stage.',
        ],
      },
      {
        type: 'heading',
        text: 'What It Means for You',
      },
      {
        type: 'paragraph',
        text: 'When you wear a piece from Surya Jewellers, you are wearing the direct product of a specific karigar\'s hands on a specific day, working from a specific sketch by our founder. No algorithm optimised it for market appeal. No factory duplicated it. It is — in the most literal sense — made for you.',
      },
      {
        type: 'paragraph',
        text: 'That is what Jaipur makes possible. That is what we are committed to protecting.',
      },
    ],
  },
  {
    slug: 'style-silver-jewellery',
    category: 'Style Guide',
    title: 'How to Style Silver Jewellery for Every Occasion',
    subtitle: 'From morning meetings to moonlit evenings — silver for every moment',
    excerpt:
      'Silver is the most versatile metal in a woman\'s jewellery wardrobe. Its cool, bright tone works with more colours, fabrics, and occasions than any other metal. The question is not whether to wear silver — it is how.',
    readTime: '5 min read',
    date: 'December 2024',
    content: [
      {
        type: 'paragraph',
        text: '92.5 sterling silver has a quality that separates it from other jewellery metals: it does not demand attention. Gold announces itself. Platinum whispers of serious wealth. Silver simply enhances — it lifts a look without overpowering it, which is exactly what versatile jewellery should do.',
      },
      {
        type: 'heading',
        text: 'Everyday Wear — Morning to Evening',
      },
      {
        type: 'paragraph',
        text: 'For daily wear, the principle is restraint with intention. A single statement piece — a detailed silver pendant, a sculptural ring, or a pair of drop earrings — is enough. Let it be the focal point.',
      },
      {
        type: 'list',
        items: [
          'A sterling silver pendant on a fine chain works with everything from a white shirt to a silk blouse. Keep the neckline visible.',
          'Stacking thin silver bands on one finger is a contemporary way to wear multiple pieces without visual noise.',
          'Small silver hoops or studs set with a single diamond or ruby are the perfect "wear and forget" earring — appropriate everywhere.',
          'A slim silver cuff on one wrist reads as polished and modern without effort.',
        ],
      },
      {
        type: 'heading',
        text: 'The Office — Professional Without Being Boring',
      },
      {
        type: 'paragraph',
        text: 'Professional environments call for jewellery that is present but not distracting. Silver handles this beautifully. A pair of silver stud earrings with a small gemstone, a delicate chain necklace, and one quality ring on each hand is a complete, considered look.',
      },
      {
        type: 'quote',
        text: 'The goal in professional dressing is to look considered, not decorated. Silver\'s clean lines make this easy.',
      },
      {
        type: 'paragraph',
        text: 'Avoid pieces that move and catch the light dramatically — chandelier earrings or large statement cuffs are better saved for evenings. In a professional context, subtlety communicates confidence.',
      },
      {
        type: 'heading',
        text: 'Festive & Formal — Letting Silver Speak Loudly',
      },
      {
        type: 'paragraph',
        text: 'This is where the full range of Surya Jewellers designs comes into its own. Intricate silver necklaces set with rubies and emeralds, dramatic chandelier earrings, layered bracelets — these are the pieces designed for moments worth dressing for.',
      },
      {
        type: 'list',
        items: [
          'With a saree or lehenga, choose silver with coloured stones — rubies against red, emeralds against green or white, sapphires against blue or ivory.',
          'For a western gown, a single bold silver collar necklace with diamond accents makes an extraordinary statement against a bare neckline.',
          'Mix silver and gold intentionally — a silver statement necklace with gold bangle stacks is a modern, fashion-forward combination.',
          'Match your metal to your undertone: silver flatters cooler, pinkish skin tones; those with warmer, yellow undertones can still wear silver beautifully by pairing it with warm-toned stones like rubies.',
        ],
      },
      {
        type: 'heading',
        text: 'Casual & Weekend',
      },
      {
        type: 'paragraph',
        text: 'The weekend is for wearing the pieces you love without overthinking them. A chunky silver ring with a large stone. Mismatched earrings — a stud in one ear, a small hoop in the other. A layered chain necklace worn over a plain t-shirt.',
      },
      {
        type: 'paragraph',
        text: 'Silver rewards casual styling. It reads effortless when worn loosely, without a strict matching set. Mix textures — a hammered silver bracelet with a smooth pendant chain, for instance.',
      },
      {
        type: 'heading',
        text: 'A Note on Skin Tone',
      },
      {
        type: 'paragraph',
        text: 'Silver is often said to suit only fair skin tones — this is a myth worth dismissing. Sterling silver with its bright, reflective quality looks extraordinary against every skin tone. The key is in the stones you choose: vivid coloured gemstones — deep rubies, bright emeralds, rich sapphires — create the contrast that makes silver jewellery come alive against deeper skin tones.',
      },
      {
        type: 'paragraph',
        text: 'Wear what you love. Silver will hold its own.',
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
