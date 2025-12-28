export const products = [
  {
    id: "v-stiff",
    name: "V-Stiff",
    slug: "v-stiff",
    category: "womens-wellness",
    price: 1999,
    image: "/products/v-stiff.png",
    shortDescription:
      "Ayurvedic vaginal tightening gel with visible results in 3 days.",
  },
  {
    id: "maxboom",
    name: "MaxBoom",
    slug: "maxboom",
    category: "womens-wellness",
    price: 2499,
    image: "/products/maxboom.png",
    shortDescription:
      "Natural breast enlargement gel & capsules with guaranteed results.",
  },
  {
    id: "nullpile",
    name: "NullPile",
    slug: "nullpile",
    category: "general-health",
    price: 1799,
    image: "/products/nullpile.png",
    shortDescription:
      "100% Ayurvedic solution for piles within 7–8 days.",
  },
  {
    id: "zeroache",
    name: "ZeroAche",
    slug: "zeroache",
    category: "general-health",
    price: 1499,
    image: "/products/zeroache.png",
    shortDescription:
      "Relieves joint & body pain. Safe for all ages and genders.",
  },
  {
    id: "virya-plus",
    name: "Virya+",
    slug: "virya-plus",
    category: "mens-wellness",
    price: 1999,
    image: "/products/virya-plus.png",
    shortDescription:
      "Ayurvedic sex booster capsule for strength & stamina.",
  },
]
export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug)
}
