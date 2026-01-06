import { Metadata } from "next"
import Image from "next/image"
import WhatsAppButton from "@/components/whatsapp-button"
import {
  Leaf,
  Heart,
  Target,
  Eye,
  Microscope,
  Globe,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Users,
  History,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/* 1. SEO METADATA & SCHEMA */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "About Naturavya | Authentic Ayurvedic Wellness & Natural Herbal Remedies",
  description: "Discover the story behind Naturavya. We bridge ancient Ayurvedic wisdom with modern science to bring you pure, plant-based wellness solutions. 100% Natural. Ethically Sourced.",
  openGraph: {
    title: "About Naturavya | Authentic Ayurvedic Wellness",
    description: "Reclaiming wellness through the power of nature. Discover our journey from roots to remedies.",
    url: "https://naturavya.com/about",
    siteName: "Naturavya",
    images: [
      {
        url: "/about-og-image.jpg", // Make sure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Naturavya Ayurvedic Herbs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Naturavya",
  "url": "https://naturavya.com",
  "logo": "https://naturavya.com/logo.png",
  "description": "Authentic Ayurvedic wellness brand bridging ancient wisdom with modern science.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gopal Niwas, Bada Ganpati",
    "addressLocality": "Indore",
    "addressRegion": "MP",
    "postalCode": "452001",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9876543210",
    "contactType": "Customer Support"
  }
}

/* ------------------------------------------------------------------ */
/* 2. DATA (Optimized for SEO) */
/* ------------------------------------------------------------------ */

const teamMembers = [
  {
    name: "Dr. Aditya Sharma",
    role: "Founder & Chief Ayurvedic Officer",
    image: "/team-founder-ayurvedic-doctor-portrait.jpg", 
    bio: "20+ years in Ayurvedic medicine, PhD from BHU. Expert in classical formulation.",
  },
  {
    name: "Priya Venkatesh",
    role: "Co-Founder & CEO",
    image: "/team-cofounder-business-woman-portrait.jpg",
    bio: "Former McKinsey, passionate about making holistic wellness accessible to all.",
  },
  {
    name: "Dr. Meenakshi Iyer",
    role: "Head of Research",
    image: "/team-research-scientist-woman-portrait.jpg",
    bio: "PhD in Pharmacology, 15+ published papers on herbal synergy.",
  },
  {
    name: "Rahul Mehta",
    role: "Chief Technology Officer",
    image: "/team-cto-tech-man-portrait.jpg",
    bio: "Ex-Amazon, building the future of personalized wellness tech.",
  },
]

const timeline = [
  { year: "2018", title: "The Vision", description: "Founded in Indore with a mission to bring authentic Ayurveda to modern India." },
  { year: "2019", title: "First Pure Formulations", description: "Launched flagship Ashwagandha and Shilajit with 100% purity guarantee." },
  { year: "2020", title: "Research Lab", description: "Established in-house R&D facility to test for heavy metals and toxins." },
  { year: "2024", title: "10K+ Families Healed", description: "Crossed 10,000 satisfied customers across India." },
]

const values = [
  { icon: Leaf, title: "Purity First", description: "Sourced directly from organic farms. No fillers, no hidden toxins." },
  { icon: Microscope, title: "Science-Backed", description: "Ancient wisdom validated by modern clinical research." },
  { icon: Heart, title: "Customer Care", description: "We treat your health like our own family's." },
  { icon: Globe, title: "Made in India", description: "Proudly manufacturing locally to support our economy." },
]

/* ------------------------------------------------------------------ */
/* 3. PAGE COMPONENT */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white">
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-20 pb-16">
        <div className="absolute inset-0 bg-green-50/50 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 mb-6">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Our Story</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Reclaiming Wellness Through the <span className="text-green-700">Power of Nature</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            At Naturavya, we bridge 5,000 years of Ayurvedic tradition with modern science to bring you pure, unadulterated wellness solutions.
          </p>
        </div>
      </section>

      {/* --- NARRATIVE SECTION (SEO Rich Text) --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl bg-gray-100">
             {/* Using a placeholder since local images might not exist yet. Replace src with your real image. */}
             
            <img 
              src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&w=800&q=80" 
              alt="Authentic Ayurvedic Herbs Preparation" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Side */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">From Roots to Remedies</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              It started with a simple question: <em>Why is it so hard to find pure, unadulterated herbal products today?</em>
            </p>
            <p className="text-gray-600 leading-relaxed">
              Naturavya was born out of a desire to change that. What began as a small passion project in <strong>Indore</strong> has grown into a trusted community of thousands who choose nature over chemicals.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every bottle of <strong>V-Stiff</strong>, every capsule of <strong>Maxx Boom</strong>, and every drop of our <strong>Zero Ache</strong> oil tells a story of purity, patience, and potency. We don't just sell products; we advocate for a lifestyle where health is natural, not synthetic.
            </p>
            
            <div className="pt-4 grid grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle2 className="text-green-600 shrink-0" />
                <span className="font-medium text-gray-800">100% Herbal Actives</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="text-green-600 shrink-0" />
                <span className="font-medium text-gray-800">Zero Side Effects</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="text-green-600 shrink-0" />
                <span className="font-medium text-gray-800">Cruelty Free</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="text-green-600 shrink-0" />
                <span className="font-medium text-gray-800">GMP Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES SECTION --- */}
      <section className="py-24 px-6 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-green-100 max-w-2xl mx-auto">The principles that guide every formulation we create.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="p-8 bg-green-800/50 rounded-2xl border border-green-700 hover:bg-green-800 transition text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-6 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-green-300" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-sm text-green-100 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION (Boosts E-E-A-T) --- */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-wider text-sm uppercase">Expertise</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Meet the Experts</h2>
            <p className="text-gray-500 mt-4">The minds combining ancient wisdom with modern research.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="h-64 bg-gray-200 relative">
                   {/* Fallback for missing images - remove this div when you have real images */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <Users size={48} />
                   </div>
                   {/* <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> */}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                  <p className="text-green-700 text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TIMELINE SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
             <span className="text-green-600 font-bold tracking-wider text-sm uppercase">History</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Our Journey</h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {timeline.map((item, index) => (
              <div key={item.year} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 group-[.is-active]:bg-green-600 text-slate-500 group-[.is-active]:text-green-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <History size={18} className="text-white" />
                </div>
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <time className="font-caveat font-medium text-green-600">{item.year}</time>
                  </div>
                  <div className="text-slate-500 text-sm">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </main>
  )
}