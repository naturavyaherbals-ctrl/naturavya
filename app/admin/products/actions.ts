'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Basic Data
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const price = parseFloat(formData.get('price') as string)
  const description = formData.get('description') as string
  const category_slug = formData.get('category') as string
  const stock = parseInt(formData.get('stock') as string) || 0
  const original_price = parseFloat(formData.get('originalPrice') as string) || null

  // 2. Extract SEO Data
  const seo_title = formData.get('seoTitle') as string || title
  const seo_description = formData.get('seoDescription') as string || description.substring(0, 150)

  // 3. Extract Arrays (Images & Benefits)
  // We expect these to be passed as JSON strings from the hidden inputs
  const imagesJSON = formData.get('imagesJSON') as string
  const benefitsJSON = formData.get('benefitsJSON') as string
  
  const images = imagesJSON ? JSON.parse(imagesJSON) : []
  const benefits = benefitsJSON ? JSON.parse(benefitsJSON) : []

  // 4. Insert into Database
  const { error } = await supabase.from('products').insert({
    title, // or 'name' depending on your column
    slug,
    price,
    description,
    category_slug,
    stock,
    original_price,
    images, // The array of image URLs
    benefits,
    seo_title,
    seo_description,
    is_active: true
  })

  if (error) {
    console.error('Error creating product:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}