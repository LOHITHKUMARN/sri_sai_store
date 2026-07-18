"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateEnquiryStatus(id: string, status: string) {
  await prisma.enquiry.update({
    where: { id },
    data: { status }
  })
  revalidatePath("/admin/enquiries")
  revalidatePath("/admin")
}
