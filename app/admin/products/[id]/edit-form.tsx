"use client"

import { useState } from "react"
import { updateProduct, deleteProduct } from "./actions"

export default function EditProductForm({ product }: { product: any }) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(product.price)
  const [description, setDescription] = useState(product.description)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    await updateProduct(product.id, {
      name,
      price,
      description,
    })
    setLoading(false)
    alert("Product updated")
  }

  async function handleDelete() {
    const ok = confirm("Delete this product?")
    if (!ok) return
    await deleteProduct(product.id)
  }

  return (
    <div className="space-y-4">
      <div>
        <label>Name</label>
        <input
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Price</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          className="border p-2 w-full"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

