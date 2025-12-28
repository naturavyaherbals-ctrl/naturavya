import { createProduct } from "../actions"

export default function NewProductPage() {
  return (
    <form action={createProduct} className="space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Add Product</h1>

      <input
        name="name"
        placeholder="Product name"
        className="w-full border p-2 rounded"
        required
      />

      <input
        name="price"
        type="number"
        placeholder="Price"
        className="w-full border p-2 rounded"
        required
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  )
}
