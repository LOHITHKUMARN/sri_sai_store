"use server"

import { prisma } from "@/lib/prisma"

export async function submitEnquiry(data: {
  name: string
  phone: string
  preferWhatsapp: boolean
  message: string
  productId?: string
  storeType: string
  sessionId: string
}) {
  await prisma.enquiry.create({
    data: {
      name: data.name,
      phone: data.phone,
      preferWhatsapp: data.preferWhatsapp,
      message: data.message,
      productId: data.productId || null,
      storeType: data.storeType,
      sessionId: data.sessionId,
    }
  })
}
