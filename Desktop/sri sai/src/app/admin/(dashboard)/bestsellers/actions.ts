"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addBestSeller(productId: string, currentLength: number) {
  // Use length as the 0-indexed order, so it's placed at the end of the current store's featured list
  await prisma.product.update({
    where: { id: productId },
    data: { 
      isBestSeller: true,
      bestSellerOrder: currentLength 
    }
  })
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}

export async function removeBestSeller(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { 
      isBestSeller: false,
      bestSellerOrder: 0
    }
  })
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}

export async function reorderBestSellers(productIds: string[]) {
  // We receive the sorted array of IDs for the CURRENT store.
  // We just assign bestSellerOrder = index for each.
  // We can do this with a transaction to ensure all or nothing.
  
  const updates = productIds.map((id, index) => {
    return prisma.product.update({
      where: { id },
      data: { bestSellerOrder: index }
    })
  })
  
  await prisma.$transaction(updates)
  
  revalidatePath("/")
  revalidatePath("/appliances")
  revalidatePath("/furniture")
  revalidatePath("/admin/bestsellers")
}
