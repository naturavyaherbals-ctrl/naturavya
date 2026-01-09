import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Don't let Google scan your admin panel!
    },
    sitemap: 'https://naturavya.com/sitemap.xml',
  }
}
