import Link from "next/link"

type Category = {
  title: string
  slug: string
  image: string
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg">
        <img
          src={category.image}
          alt={category.title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />

        <div className="absolute bottom-6 left-6 z-10">
          <h3 className="text-xl font-semibold text-white">
            {category.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}