export default function SeoSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.naturavya.com/#organization",
        name: "Naturavya Herbals",
        url: "https://www.naturavya.com",
        logo: "https://www.naturavya.com/logo.png",
        description:
          "Naturavya is an Indian Ayurvedic wellness brand offering natural solutions for male sexual health, vitality, stamina, piles relief and joint pain using authentic herbal formulations.",
        sameAs: [
          "https://www.facebook.com/naturavya",
          "https://www.instagram.com/naturavya",
          "https://www.youtube.com/@naturavya",
        ],
      },

      {
        "@type": "WebSite",
        "@id": "https://www.naturavya.com/#website",
        url: "https://www.naturavya.com",
        name: "Naturavya Ayurvedic Wellness",
        publisher: {
          "@id": "https://www.naturavya.com/#organization",
        },
        inLanguage: "en-IN",
      },

      {
        "@type": "ItemList",
        name: "Naturavya Ayurvedic Products",
        itemListElement: [
          {
            "@type": "Product",
            name: "Virya+ Capsules",
            category: "Ayurvedic Male Sexual Wellness",
          },
          {
            "@type": "Product",
            name: "VStiff Gel",
            category: "Ayurvedic Performance Gel",
          },
          {
            "@type": "Product",
            name: "MaxBoom Capsules",
            category: "Ayurvedic Strength & Vitality",
          },
          {
            "@type": "Product",
            name: "MaxBoom Gel",
            category: "Ayurvedic Massage Gel",
          },
          {
            "@type": "Product",
            name: "NullPile Capsules",
            category: "Ayurvedic Piles Care",
          },
          {
            "@type": "Product",
            name: "ZeroAche Oil",
            category: "Ayurvedic Pain Relief Oil",
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
