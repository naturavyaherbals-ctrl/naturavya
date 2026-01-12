import Script from "next/script"

export default function SeoSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      // Product 1: Maxx Boom
      {
        "@type": "Product",
        "name": "Maxx Boom Capsules & Gel",
        "image": "https://naturavya.com/hero-product.png",
        "description": "Ayurvedic breast enhancement and toning formula. 100% natural herbal ingredients including Shatavari and Ashwagandha.",
        "brand": {
          "@type": "Brand",
          "name": "Naturavya Herbals"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://naturavya.com/shop/maxx-boom",
          "priceCurrency": "INR",
          "price": "1499",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "850"
        }
      },
      // Product 2: Virya Plus
      {
        "@type": "Product",
        "name": "Virya Plus Vitality Booster",
        "image": "https://naturavya.com/virya-plus.png",
        "description": "Premium Ayurvedic vitality supplement for men. Boosts stamina and energy naturally without side effects.",
        "brand": {
          "@type": "Brand",
          "name": "Naturavya Herbals"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://naturavya.com/shop/virya-plus",
          "priceCurrency": "INR",
          "price": "1299",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1200"
        }
      },
      // Product 3: Zero Ache
      {
        "@type": "Product",
        "name": "Zero Ache Pain Relief Oil",
        "image": "https://naturavya.com/zero-ache.png",
        "description": "Fast-acting herbal pain relief oil for joint pain, arthritis, and muscle stiffness. Deep penetration formula.",
        "brand": {
          "@type": "Brand",
          "name": "Naturavya Herbals"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://naturavya.com/shop/zero-ache",
          "priceCurrency": "INR",
          "price": "499",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.7",
          "reviewCount": "450"
        }
      },
      // Local Business Schema (Helps rank in Indore)
      {
        "@type": "LocalBusiness",
        "name": "Naturavya Herbals",
        "image": "https://naturavya.com/og-home.jpg",
        "telephone": "+917222959340",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gopal Nivas Building, Bada Ganpati",
          "addressLocality": "Indore",
          "addressRegion": "MP",
          "postalCode": "452001",
          "addressCountry": "IN"
        },
        "priceRange": "₹₹",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "10:00",
          "closes": "20:00"
        }
      }
    ]
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}