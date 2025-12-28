export interface Promotion {
  id: string
  title: string
  subtitle: string
  description: string
  discount: string
  code?: string
  buttonText: string
  buttonLink: string
  image: string
  bgGradient: string
  textColor: "light" | "dark"
  isActive: boolean
  startDate: string
  endDate: string
  order: number
}

export const promotions: Promotion[] = [
  {
    id: "promo-1",
    title: "Summer Wellness Sale",
    subtitle: "Limited Time Offer",
    description: "Get up to 40% off on all Ayurvedic supplements. Boost your immunity naturally this season.",
    discount: "40% OFF",
    code: "SUMMER40",
    buttonText: "Shop Now",
    buttonLink: "/categories",
    image: "/ayurvedic-golden-bottles-summer-wellness.jpg",
    bgGradient: "from-amber-600 via-orange-500 to-yellow-500",
    textColor: "light",
    isActive: true,
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    order: 1,
  },
  {
    id: "promo-2",
    title: "Men's Health Bundle",
    subtitle: "Exclusive Combo",
    description: "Complete vitality pack with VitaMax Pro, Shilajit Gold & Energy Booster at unbeatable prices.",
    discount: "SAVE Rs.1500",
    code: "MENPOWER",
    buttonText: "View Bundle",
    buttonLink: "/categories/mens-health",
    image: "/mens-health-supplements-ayurvedic-bottles.jpg",
    bgGradient: "from-emerald-700 via-green-600 to-teal-500",
    textColor: "light",
    isActive: true,
    startDate: "2025-06-01",
    endDate: "2025-07-15",
    order: 2,
  },
  {
    id: "promo-3",
    title: "Women's Wellness Week",
    subtitle: "Self Care Special",
    description: "Discover SheBalance and other natural solutions crafted for women's unique health needs.",
    discount: "25% OFF",
    code: "SHECARE25",
    buttonText: "Explore Now",
    buttonLink: "/categories/womens-health",
    image: "/womens-wellness-ayurvedic-pink-botanical.jpg",
    bgGradient: "from-rose-600 via-pink-500 to-fuchsia-500",
    textColor: "light",
    isActive: true,
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    order: 3,
  },
  {
    id: "promo-4",
    title: "Free Shipping",
    subtitle: "No Minimum Order",
    description: "Enjoy free express delivery on all orders. Your wellness journey starts at your doorstep.",
    discount: "FREE DELIVERY",
    buttonText: "Start Shopping",
    buttonLink: "/categories",
    image: "/delivery-package-herbs-ayurvedic.jpg",
    bgGradient: "from-primary via-primary/90 to-emerald-600",
    textColor: "light",
    isActive: true,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    order: 4,
  },
]
