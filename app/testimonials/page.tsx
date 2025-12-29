"use client";

export const dynamic = "force-dynamic";

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { TestimonialCard } from "@/components/testimonial-card"
import { testimonials } from "@/lib/reviews-data"
import { Quote, Heart, Users, Award } from "lucide-react"

export const metadata = {
  title: "Customer Stories | Naturavya",
  description:
    "Read inspiring wellness journeys from our customers who have transformed their lives with Naturavya.",
}

export default function TestimonialsPage() {
  const featuredTestimonials = testimonials.filter((t) => t.featured)
  const otherTestimonials = testimonials.filter((t) => !t.featured)

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Quote className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">
            Customer <span className="text-primary font-medium">Stories</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover inspiring wellness journeys from real people who have transformed their lives with Naturavya.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
          {[
            { icon: Users, value: "10,000+", label: "Happy Customers" },
            { icon: Heart, value: "98%", label: "Satisfaction Rate" },
            { icon: Award, value: "500+", label: "5-Star Reviews" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light mb-8">
            Featured <span className="text-primary font-medium">Stories</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {featuredTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Other */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light mb-8">
            More <span className="text-primary font-medium">Journeys</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
