"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function removeFeaturedProduct(id: string) {
  await prisma.product.update({
    where: { id },
    data: { 
      isFeatured: false,
      featuredOrder: 0
    }
  })
  revalidatePath("/")
  revalidatePath("/admin/featured")
}

export async function addFeaturedProduct(id: string, currentCount: number) {
  await prisma.product.update({
    where: { id },
    data: { 
      isFeatured: true,
      featuredOrder: currentCount + 1,
      featuredAt: new Date()
    }
  })
  revalidatePath("/")
  revalidatePath("/admin/featured")
}

export async function reorderFeaturedProducts(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => {
    return prisma.product.update({
      where: { id },
      data: { featuredOrder: index + 1 }
    })
  })
  
  await prisma.$transaction(updates)
  
  revalidatePath("/")
  revalidatePath("/admin/featured")
}
