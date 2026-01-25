'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Create a single instance to be used on the client
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
}