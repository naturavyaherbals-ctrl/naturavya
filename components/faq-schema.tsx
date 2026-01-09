"use client"

export default function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Naturavya Herbals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Naturavya Herbals is an Indian Ayurvedic wellness brand that offers natural herbal formulations designed to support male vitality, sexual wellness, joint comfort, digestive balance, and overall well-being using traditional Ayurvedic principles."
        }
      },
      {
        "@type": "Question",
        "name": "Are Naturavya products Ayurvedic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Naturavya products are inspired by classical Ayurvedic knowledge and prepared using carefully selected herbal ingredients. They are developed to align with traditional Ayurvedic wellness practices while meeting modern quality standards."
        }
      },
      {
        "@type": "Question",
        "name": "What are Virya+ Capsules used for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Virya+ Capsules are formulated to support male vitality, stamina, confidence, and overall wellness as part of a balanced Ayurvedic lifestyle."
        }
      },
      {
        "@type": "Question",
        "name": "What is VStiff Gel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VStiff Gel is an Ayurvedic herbal gel designed to support male performance and intimate wellness when used as directed."
        }
      },
      {
        "@type": "Question",
        "name": "What are MaxBoom Capsules and Gel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MaxBoom Capsules and Gel are Ayurvedic formulations developed to support strength, endurance, and vitality as part of daily wellness routines."
        }
      },
      {
        "@type": "Question",
        "name": "What is NullPile Capsules used for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NullPile Capsules are Ayurvedic herbal capsules designed to support digestive comfort and piles-related wellness naturally."
        }
      },
      {
        "@type": "Question",
        "name": "What is ZeroAche Oil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ZeroAche Oil is an Ayurvedic herbal oil formulated to support joint comfort, muscle relaxation, and physical wellness through traditional massage practices."
        }
      },
      {
        "@type": "Question",
        "name": "Are Naturavya products safe for daily use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Naturavya products are designed for long-term wellness and are generally suitable for regular use when taken as directed. For individual health concerns, consulting a qualified healthcare professional is recommended."
        }
      },
      {
        "@type": "Question",
        "name": "Do Naturavya products contain steroids or harmful chemicals?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, Naturavya products are formulated without steroids or harmful synthetic chemicals and focus on natural Ayurvedic ingredients."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I buy Naturavya Ayurvedic products?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Naturavya Ayurvedic products can be purchased directly through the official Naturavya website and are available for delivery across India."
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

