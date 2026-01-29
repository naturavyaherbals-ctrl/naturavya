'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold text-emerald-800">
              Naturavya Herbals
            </h2>
            <p className="text-sm text-gray-600">
              100% Ayurvedic, doctor-approved formulations for real, long-term results.
              Made in India, trusted by thousands of families.
            </p>
            <p className="text-xs text-gray-400">
              This site is for informational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-emerald-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-600">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-emerald-600">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="hover:text-emerald-600">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/(shop)/checkout" className="hover:text-emerald-600">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="hover:text-emerald-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-emerald-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-emerald-600">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} Naturavya Herbals. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Ayurvedic wellness for modern lifestyles.
          </p>
        </div>
      </div>
    </footer>
  );
}
