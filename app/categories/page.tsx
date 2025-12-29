"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabaseServer } from "@supabase/supabase-js";

const supabase = supabaseServer(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from("categories").select("*");
      setCategories(data || []);
      setLoading(false);
    }
    loadCategories();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>

        {loading && <p>Loading...</p>}

        {!loading && categories.length === 0 && (
          <p>No categories found.</p>
        )}

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <li key={cat.id} className="border p-3 rounded">
              {cat.name}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
