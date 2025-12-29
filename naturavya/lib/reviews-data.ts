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

export const reviews: Review[] = [
  {
    id: "1",
    customerName: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    avatar: "/indian-man-professional-portrait.png",
    rating: 5,
    title: "Life-changing results!",
    content:
      "I've been using Ashwagandha Vitality Capsules for 3 months now and the difference is remarkable. My energy levels have improved significantly, and I feel more focused throughout the day. The quality is exceptional - you can tell these are premium ingredients.",
    productName: "Ashwagandha Vitality Capsules",
    productSlug: "ashwagandha-vitality-capsules",
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
    title: "Finally found something that works!",
    content:
      "The Shatavari Balance Elixir has been a game-changer for my hormonal health. After trying numerous products, this is the only one that has provided real, noticeable results. Highly recommend to all women looking for natural solutions.",
    productName: "Shatavari Balance Elixir",
    productSlug: "shatavari-balance-elixir",
    date: "2025-01-10",
    verified: true,
    helpful: 38,
  },
  {
    id: "3",
    customerName: "Amit Patel",
    location: "Bangalore, Karnataka",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    title: "Pure quality Shilajit",
    content:
      "I've tried many Shilajit products over the years, but Naturavya's Himalayan sourced resin is unmatched. The purity is evident from the first use. My stamina and overall vitality have improved tremendously.",
    productName: "Shilajit Power Resin",
    productSlug: "shilajit-power-resin",
    date: "2025-01-08",
    verified: true,
    helpful: 52,
  },
  {
    id: "4",
    customerName: "Meera Reddy",
    location: "Hyderabad, Telangana",
    avatar: "/indian-woman-middle-age-portrait.jpg",
    rating: 5,
    title: "Excellent for mental clarity",
    content:
      "As a professional dealing with high-stress work, Brahmi Mind Clarity has been a blessing. My focus and memory have improved, and I feel calmer even during hectic days. The capsules are easy to take and have no side effects.",
    productName: "Brahmi Mind Clarity",
    productSlug: "brahmi-mind-clarity",
    date: "2025-01-05",
    verified: true,
    helpful: 29,
  },
  {
    id: "5",
    customerName: "Suresh Menon",
    location: "Chennai, Tamil Nadu",
    avatar: "/indian-man-professional-portrait.png",
    rating: 4,
    title: "Good product, slightly expensive",
    content:
      "The product quality is excellent and I've seen good results with the Ashwagandha capsules. The only reason for 4 stars is the price point, which is slightly higher than competitors. However, you do get what you pay for in terms of quality.",
    productName: "Ashwagandha Vitality Capsules",
    productSlug: "ashwagandha-vitality-capsules",
    date: "2024-12-28",
    verified: true,
    helpful: 18,
  },
  {
    id: "6",
    customerName: "Anita Desai",
    location: "Pune, Maharashtra",
    avatar: "/indian-woman-professional-portrait.png",
    rating: 5,
    title: "Natural and effective",
    content:
      "I was skeptical about Ayurvedic products at first, but the Women's Vitality Blend has made me a believer. My menstrual cycles are more regular, and I have more energy throughout the month. Truly grateful for this product!",
    productName: "Women's Vitality Blend",
    productSlug: "womens-vitality-blend",
    date: "2024-12-20",
    verified: true,
    helpful: 34,
  },
  {
    id: "7",
    customerName: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    title: "Immunity boost during winter",
    content:
      "Started taking the Immunity Booster Kadha at the start of winter and haven't fallen sick once! The taste is pleasant and it's become a daily ritual now. Great value for money too.",
    productName: "Immunity Booster Kadha",
    productSlug: "immunity-booster-kadha",
    date: "2024-12-15",
    verified: true,
    helpful: 41,
  },
  {
    id: "8",
    customerName: "Kavita Joshi",
    location: "Ahmedabad, Gujarat",
    avatar: "/indian-woman-middle-age-portrait.jpg",
    rating: 5,
    title: "Premium quality intimate care",
    content:
      "The Intimate Wellness Oil is luxurious and effective. Natural ingredients, pleasant fragrance, and no irritation. Finally found a product that meets all my expectations for intimate care.",
    productName: "Intimate Wellness Oil",
    productSlug: "intimate-wellness-oil",
    date: "2024-12-10",
    verified: true,
    helpful: 22,
  },
]

export const testimonials: Testimonial[] = [
  {
    id: "1",
    customerName: "Dr. Arun Mehta",
    location: "Mumbai",
    avatar: "/indian-man-professional-portrait.png",
    rating: 5,
    story:
      "As a physician, I was initially skeptical about Ayurvedic supplements. However, after recommending Naturavya products to several patients with chronic fatigue and stress, I've witnessed remarkable improvements. The scientific approach combined with traditional wisdom makes their products stand out. I now personally use their Ashwagandha capsules daily.",
    productUsed: "Ashwagandha Vitality Capsules",
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
      "My wellness journey with Naturavya started 6 months ago when I was struggling with hormonal imbalances and low energy. The Shatavari Balance Elixir combined with their Women's Vitality Blend has transformed my health completely. My skin is glowing, my energy is consistent, and I finally feel like myself again. This is not just a product - it's a complete wellness solution.",
    productUsed: "Shatavari Balance Elixir",
    date: "2025-01-05",
    featured: true,
  },
  {
    id: "3",
    customerName: "Ravi Shankar",
    location: "Delhi",
    avatar: "/indian-man-young-professional-portrait.jpg",
    rating: 5,
    story:
      "At 45, I thought declining energy and stamina were just part of aging. Naturavya's Shilajit Power Resin proved me wrong. Within 2 months, I felt 10 years younger. My gym performance improved, my mind is sharper, and my overall zest for life has returned. The purity of their Himalayan Shilajit is evident in every dose.",
    productUsed: "Shilajit Power Resin",
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
      "Being a yoga instructor, I'm very particular about what I put in my body. Naturavya's commitment to purity and authenticity resonates with my philosophy. Their Brahmi Mind Clarity has enhanced my meditation practice, and I recommend it to all my students. The clarity and calmness it provides is unmatched.",
    productUsed: "Brahmi Mind Clarity",
    date: "2024-12-20",
    featured: false,
  },
  {
    id: "5",
    customerName: "Prakash & Neeta Gupta",
    location: "Kolkata",
    avatar: "/indian-man-professional-portrait.png",
    rating: 5,
    story:
      "As a couple in our 50s, we were looking for natural solutions to improve our overall wellness and intimacy. Naturavya's products have exceeded our expectations. The Intimate Wellness Oil is luxurious, and the supplements have improved our energy levels. We're grateful for products that respect both tradition and modern needs.",
    productUsed: "Intimate Wellness Oil",
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
      "Working in IT with long hours and high stress, I was burning out. A friend recommended Naturavya's Ashwagandha, and it's been a game-changer. My stress levels are manageable, I sleep better, and I have more patience with my family. Sometimes the ancient solutions are the best ones.",
    productUsed: "Ashwagandha Vitality Capsules",
    date: "2024-12-10",
    featured: false,
  },
]
