export interface WebsiteImage {
  id: string
  name: string
  page: string
  section: string
  currentImage: string
  description: string
  dimensions: string
  lastUpdated: string
}

export const websiteImages: WebsiteImage[] = [
  // Home Page
  {
    id: "home-hero-bg",
    name: "Hero Background",
    page: "Home",
    section: "Hero Section",
    currentImage: "/ayurvedic-herbs-golden-light-wellness.jpg",
    description: "Main hero background image with Ayurvedic elements",
    dimensions: "1920x1080",
    lastUpdated: "2025-06-01",
  },
  {
    id: "home-hero-product",
    name: "Hero Product",
    page: "Home",
    section: "Hero Section",
    currentImage: "/ayurvedic-premium-product-bottle.jpg",
    description: "Featured product display in hero section",
    dimensions: "600x600",
    lastUpdated: "2025-06-01",
  },
  {
    id: "home-ingredients-ashwagandha",
    name: "Ashwagandha",
    page: "Home",
    section: "Ingredients",
    currentImage: "/ashwagandha-root-herb.jpg",
    description: "Ashwagandha ingredient image",
    dimensions: "300x300",
    lastUpdated: "2025-05-15",
  },
  {
    id: "home-ingredients-shilajit",
    name: "Shilajit",
    page: "Home",
    section: "Ingredients",
    currentImage: "/shilajit-resin-himalayan.jpg",
    description: "Shilajit ingredient image",
    dimensions: "300x300",
    lastUpdated: "2025-05-15",
  },
  // About Page
  {
    id: "about-hero",
    name: "About Hero",
    page: "About",
    section: "Hero Section",
    currentImage: "/ayurvedic-herbs-mortar-pestle-traditional.jpg",
    description: "About page hero image",
    dimensions: "1920x1080",
    lastUpdated: "2025-05-20",
  },
  {
    id: "about-story-1",
    name: "Brand Story 1",
    page: "About",
    section: "Our Story",
    currentImage: "/ancient-ayurvedic-text-manuscript-botanical.jpg",
    description: "First brand story image",
    dimensions: "800x600",
    lastUpdated: "2025-05-20",
  },
  {
    id: "about-team-founder",
    name: "Founder Image",
    page: "About",
    section: "Team",
    currentImage: "/team-founder-ayurvedic-doctor-portrait.jpg",
    description: "Founder profile image",
    dimensions: "400x400",
    lastUpdated: "2025-05-20",
  },
  // Categories Page
  {
    id: "category-mens-health",
    name: "Men's Health Banner",
    page: "Categories",
    section: "Category Cards",
    currentImage: "/mens-health-vitality-ayurvedic.jpg",
    description: "Men's health category banner",
    dimensions: "600x400",
    lastUpdated: "2025-05-10",
  },
  {
    id: "category-womens-health",
    name: "Women's Health Banner",
    page: "Categories",
    section: "Category Cards",
    currentImage: "/womens-wellness-ayurvedic-botanical.jpg",
    description: "Women's health category banner",
    dimensions: "600x400",
    lastUpdated: "2025-05-10",
  },
  {
    id: "category-immunity",
    name: "Immunity Banner",
    page: "Categories",
    section: "Category Cards",
    currentImage: "/immunity-boost-herbs-ayurvedic.jpg",
    description: "Immunity category banner",
    dimensions: "600x400",
    lastUpdated: "2025-05-10",
  },
  // Reviews Page
  {
    id: "reviews-hero",
    name: "Reviews Hero",
    page: "Reviews",
    section: "Hero Section",
    currentImage: "/happy-customers-testimonials-wellness.jpg",
    description: "Reviews page hero background",
    dimensions: "1200x600",
    lastUpdated: "2025-05-25",
  },
  // Testimonials Page
  {
    id: "testimonials-featured",
    name: "Featured Testimonial BG",
    page: "Testimonials",
    section: "Featured Section",
    currentImage: "/happy-customer-wellness-journey-.jpg",
    description: "Featured testimonial background",
    dimensions: "1920x800",
    lastUpdated: "2025-05-25",
  },
]

export const pageOptions = ["Home", "About", "Categories", "Products", "Reviews", "Testimonials"]
