"use client"

import { Leaf, Droplet, HeartPulse, Sparkles } from "lucide-react"

const ingredients = [
  {
    icon: Leaf,
    title: "100% Herbal",
    description:
      "Made using authentic Ayurvedic herbs sourced from trusted farms.",
  },
  {
    icon: Droplet,
    title: "Cold-Pressed Oils",
    description:
      "Extracted using traditional cold-press methods to retain potency.",
  },
  {
    icon: HeartPulse,
    title: "Clinically Inspired",
    description:
      "Formulated with modern wellness research and ancient wisdom.",
  },
  {
    icon: Sparkles,
    title: "No Chemicals",
    description:
      "Free from parabens, sulfates, artificial colors, and fragrances.",
  },
]

export default function IngredientsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pure Ayurvedic Ingredients
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every Naturavya product is crafted with time-tested herbs and
            uncompromising quality standards.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ingredients.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-background rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-lg font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


