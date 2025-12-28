"use client";

import { useState } from "react";

export default function AddToCart({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function addToCart() {
    setLoading(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Please login first");
      return;
    }

    alert("Added to cart ✅");
  }

  return (
    <button
      onClick={addToCart}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
