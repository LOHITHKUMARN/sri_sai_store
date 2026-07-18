import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionId, pageUrl, productId, storeType } = body

    if (!sessionId || !pageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.visit.create({
      data: {
        sessionId,
        pageUrl,
        productId: productId || null,
        storeType: storeType || "unknown"
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Tracking error:", error)
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 })
  }
}
