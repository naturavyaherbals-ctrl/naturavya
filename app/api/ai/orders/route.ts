export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const aiKey = req.headers.get("x-ai-key")

  return NextResponse.json({
    headerKey: aiKey,
    envKey: process.env.AI_SECRET_KEY,
    equal: aiKey === process.env.AI_SECRET_KEY
  })
}
