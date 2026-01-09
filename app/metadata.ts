import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.naturavya.com"),

  title: {
    default:
      "Naturavya® | Ayurvedic Sexual Wellness & Male Vitality Products in India",
    template: "%s | Naturavya Ayurvedic Wellness",
  },

  description:
    "Naturavya is India’s trusted Ayurvedic wellness brand offering natural solutions for male sexual health, stamina, vitality, firmness, piles relief, and joint pain. Explore Virya+, VStiff Gel, MaxBoom, NullPile Capsules & ZeroAche Oil made with authentic Ayurvedic herbs.",

  keywords: [
    "Naturavya",
    "Ayurvedic sexual wellness",
    "male sexual health ayurveda",
    "Virya+ capsules",
    "VStiff gel",
    "MaxBoom capsules",
    "MaxBoom gel",
    "NullPile capsules",
    "ZeroAche oil",
    "ayurvedic stamina medicine",
    "ayurvedic performance enhancer",
    "natural male vitality products",
    "herbal sexual wellness india",
    "ayurvedic joint pain oil",
    "ayurvedic piles medicine",
  ],

  authors: [{ name: "Naturavya Herbals" }],
  creator: "Naturavya Herbals",
  publisher: "Naturavya Herbals",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.naturavya.com",
    siteName: "Naturavya Ayurvedic Wellness",
    title:
      "Naturavya® | Ayurvedic Sexual Wellness & Vitality Solutions for Men",
    description:
      "Discover premium Ayurvedic wellness products for male sexual health, stamina, vitality, piles relief and joint pain. Naturavya blends ancient Ayurveda with modern science for safe, effective results.",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Naturavya Ayurvedic Wellness Products",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Naturavya® | Ayurvedic Sexual Wellness & Male Vitality Products",
    description:
      "India’s modern Ayurvedic brand for male sexual wellness, stamina, firmness, pain relief & vitality. Explore Virya+, VStiff Gel, MaxBoom & more.",
    images: ["/og-home.jpg"],
    creator: "@naturavya",
  },

  category: "Health & Wellness",
}
