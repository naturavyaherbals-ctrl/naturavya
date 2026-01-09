export const products = [
  {
    id: "v-stiff",
    name: "V-Stiff",
    slug: "v-stiff",
    category: "womens-wellness",
    price: 1999,
    image: "/products/v-stiff.png",
    shortDescription:
      "Restore natural elasticity and confidence with V-Stiff, a 100% Ayurvedic vaginal tightening gel. Formulated with pure herbal extracts to firm delicate tissues safely, offering visible tightening results in just 3 days without irritation.",
  },
  {
    id: "maxboom",
    name: "MaxBoom",
    slug: "maxboom",
    category: "womens-wellness",
    price: 2499,
    image: "/products/maxboom.png",
    shortDescription:
      "Achieve natural curves with MaxBoom, the complete Ayurvedic breast enhancement therapy (Capsules & Gel). This herbal formula promotes natural growth, lifts sagging tissues, and enhances shape safely with zero side effects.",
  },
  {
    id: "nullpile",
    name: "NullPile",
    slug: "nullpile",
    category: "general-health",
    price: 1799,
    image: "/products/nullpile.png",
    shortDescription:
      "Stop piles pain and bleeding naturally with NullPile Capsules. A powerful Ayurvedic remedy that shrinks hemorrhoids, heals fissures, and improves digestion to provide complete relief in 7–8 days, helping you avoid surgery.",
  },
  {
    id: "zeroache",
    name: "ZeroAche",
    slug: "zeroache",
    category: "general-health",
    price: 1499,
    image: "/products/zeroache.png",
    shortDescription:
      "Get instant relief from chronic joint pain, arthritis, and muscle stiffness with ZeroAche Oil. This deep-penetrating herbal analgesic reduces inflammation and restores mobility, safe for seniors and active individuals alike.",
  },
  {
    id: "virya-plus",
    name: "Virya+",
    slug: "virya-plus",
    category: "mens-wellness",
    price: 1999,
    image: "/products/virya-plus.png",
    shortDescription:
      "Boost male vitality and stamina with Virya+ Capsules, a premium Ayurvedic performance booster. Enriched with pure Shilajit and Ashwagandha, it enhances strength, timing, and energy levels for a healthy, confident intimate life.",
  },
]

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}
