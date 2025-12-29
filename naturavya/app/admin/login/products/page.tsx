import { products } from "@/lib/products-data"

export default function AdminProductsPage() {
  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">
        Products
      </h2>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-t">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4 capitalize">{p.category}</td>
                <td className="p-4 text-green-600">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
