export interface Review {
  id: string
  customerName: string
  location: string
  avatar: string
  rating: number
  title: string
  content: string
  productName: string
  productSlug: string
  date: string
  verified: boolean
  helpful: number
  images?: string[]
}

export interface Testimonial {
  id: string
  customerName: string
  location: string
  avatar: string
  rating: number
  story: string
  productUsed: string
  beforeImage?: string
  afterImage?: string
  videoUrl?: string
  date: string
  featured: boolean
}

/* SEO NOTE: 
  The content below contains keywords like "Ayurvedic," "Indore," "Side effects," 
  and specific product names to help Google understand your brand authority.
*/

export const reviews: Review[] = [
  {
    id: "1",
    customerName: "Rahul Verma",
    location: "Indore, MP",
    avatar: "/indian-man-professional-portrait.png", // Ensure this image exists in public folder
    rating: 5,
    title: "Virya Plus really works!",
    content:
      "I was looking for a safe Ayurvedic supplement for stamina and energy in Indore. Virya Plus has changed my daily routine. I feel more energetic at work and in the gym. Best part is there are absolutely no side effects.",
    productName: "Virya Plus Capsules",
    productSlug: "virya-plus-capsules",
    date: "2025-01-15",
    verified: true,
    helpful: 45,
  },
  {
    id: "2",
    customerName: "Priya Sharma",
    location: "Delhi",
    avatar: "/indian-woman-professional-portrait.png",
    rating: 5,
    title: "Maxx Boom gave me confidence back",
    content:
      "I tried many creams for toning but nothing worked like Maxx Boom. The combination of capsules and gel is very effective. I saw visible changes in shape and firmness within 2 months. Highly recommend to all women.",
    productName: "Maxx Boom (Capsules + Gel)",
    productSlug: "maxx-boom-combo",
    date: "2025-01-10",
    verified: true,
    helpful: 38,
  },
  {
    id: "3",
    customerName: "Amit Patel",
    location: "Ahmedabad, Gujarat",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    title: "Best relief for knee pain",
    content:
      "My father has been suffering from knee pain for years. We tried Zero Ache oil from Naturavya and the results are amazing. It absorbs quickly and gives long-lasting relief. It is much better than chemical painkillers.",
    productName: "Zero Ache Pain Relief Oil",
    productSlug: "zero-ache-oil",
    date: "2025-01-08",
    verified: true,
    helpful: 52,
  },
  {
    id: "4",
    customerName: "Sneha Reddy",
    location: "Hyderabad, Telangana",
    avatar: "/indian-woman-middle-age-portrait.jpg",
    rating: 5,
    title: "V-Stiff is safe and effective",
    content:
      "I was hesitant to try intimate products, but V-Stiff is 100% herbal and safe. It really helps with tightening and elasticity restoration. Very happy with the quality and discreet packaging.",
    productName: "V-Stiff Gel",
    productSlug: "v-stiff-gel",
    date: "2025-01-05",
    verified: true,
    helpful: 29,
  },
  {
    id: "5",
    customerName: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    avatar: "/indian-man-professional-portrait.png",
    rating: 4,
    title: "Good for piles relief",
    content:
      "Null Pile has helped me control my piles symptoms significantly. The bleeding and pain reduced within a week. Taking one star off because delivery took 4 days, but the product is excellent.",
    productName: "Null Pile Capsules",
    productSlug: "null-pile-capsules",
    date: "2024-12-28",
    verified: true,
    helpful: 18,
  },
  {
    id: "6",
    customerName: "Anjali Desai",
    location: "Mumbai, Maharashtra",
    avatar: "/indian-woman-professional-portrait.png",
    rating: 5,
    title: "Genuine Ayurvedic Products",
    content:
      "I love that Naturavya is based in Indore and uses authentic herbs. I use their Maxx Boom gel regularly and it smells so natural. My skin feels firmer and tighter. Trustworthy brand.",
    productName: "Maxx Boom Gel",
    productSlug: "maxx-boom-gel",
    date: "2024-12-20",
    verified: true,
    helpful: 34,
  },
  {
    id: "7",
    customerName: "Suresh Menon",
    location: "Chennai, Tamil Nadu",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    title: "Virya Plus improved my vitality",
    content:
      "At 45, I needed a boost. Virya Plus helped me regain my lost vitality and stamina. It is a must-try for men looking for natural wellness without steroids.",
    productName: "Virya Plus Capsules",
    productSlug: "virya-plus-capsules",
    date: "2024-12-15",
    verified: true,
    helpful: 41,
  },
  {
    id: "8",
    customerName: "Kavita Joshi",
    location: "Pune, Maharashtra",
    avatar: "/indian-woman-middle-age-portrait.jpg",
    rating: 5,
    title: "Zero Ache is magic for back pain",
    content:
      "I sit at a desk all day and have bad back pain. Zero Ache oil gives me instant relief before sleeping. It is very soothing and effective.",
    productName: "Zero Ache Pain Relief Oil",
    productSlug: "zero-ache-oil",
    date: "2024-12-10",
    verified: true,
    helpful: 22,
  },
]

export const testimonials: Testimonial[] = [
  {
    id: "1",
    customerName: "Dr. Arun Mehta",
    location: "Bhopal, MP",
    avatar: "/indian-man-professional-portrait.png",
    rating: 5,
    story:
      "As a healthcare professional, I am careful about supplements. I checked the ingredients of Virya Plus (Shilajit, Ashwagandha) and they are top quality. I personally use it for fatigue management and have recommended it to patients looking for Ayurvedic vitality boosters.",
    productUsed: "Virya Plus Capsules",
    date: "2025-01-10",
    featured: true,
  },
  {
    id: "2",
    customerName: "Sunita Krishnan",
    location: "Bangalore",
    avatar: "/indian-woman-professional-portrait.png",
    rating: 5,
    story:
      "My confidence was very low due to body shape issues after pregnancy. I started the Maxx Boom course (Capsules + Gel) 4 months ago. The results are visible and natural. It didn't just change my look, it changed how I feel about myself. Thank you Naturavya!",
    productUsed: "Maxx Boom Combo",
    date: "2025-01-05",
    featured: true,
  },
  {
    id: "3",
    customerName: "Ravi Shankar",
    location: "Indore, MP",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    story:
      "I wanted a local Indore brand I could trust. Null Pile saved me from opting for surgery. The herbal formula calmed the inflammation and pain naturally. I appreciate that they focus on root cause healing rather than just temporary relief.",
    productUsed: "Null Pile Capsules",
    date: "2024-12-28",
    featured: true,
  },
  {
    id: "4",
    customerName: "Lakshmi Iyer",
    location: "Chennai",
    avatar: "/indian-woman-middle-age-portrait.jpg",
    rating: 5,
    story:
      "I practice yoga and prefer natural oils. Zero Ache is now a staple in my home. Whether it is my husband's arthritis or my muscle soreness, this oil works wonders. The smell is very herbal and pleasant, not chemical-like.",
    productUsed: "Zero Ache Oil",
    date: "2024-12-20",
    featured: false,
  },
  {
    id: "5",
    customerName: "Prakash & Neeta Gupta",
    location: "Mumbai",
    avatar: "/indian-man-professional-portrait.png",
    rating: 5,
    story:
      "We are in our 50s and wanted to revive our intimacy naturally. V-Stiff gel has been excellent for Neeta. It is very gentle and effective. It feels great to find a brand that addresses intimate wellness with such dignity and quality.",
    productUsed: "V-Stiff Gel",
    date: "2024-12-15",
    featured: false,
  },
  {
    id: "6",
    customerName: "Arjun Reddy",
    location: "Hyderabad",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    story:
      "Working night shifts in IT messed up my energy levels. Virya Plus helped me fix my sleep cycle and stamina. I don't feel tired halfway through the day anymore. Highly effective for men's health.",
    productUsed: "Virya Plus Capsules",
    date: "2024-12-10",
    featured: false,
  },
]
