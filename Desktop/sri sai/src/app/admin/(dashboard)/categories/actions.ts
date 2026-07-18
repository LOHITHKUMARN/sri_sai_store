"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getStores() {
  return await prisma.store.findMany()
}

export async function getCategories() {
  return await prisma.category.findMany({
    include: {
      store: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export async function createCategory(data: { name: string, storeId: string }) {
  await prisma.category.create({
    data: {
      name: data.name,
      storeId: data.storeId,
    }
  })
  revalidatePath("/admin/categories")
}

export async function deleteCategory(id: string) {
  // Prevent deletion if there are products attached
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } }
  })

  if (category?._count.products && category._count.products > 0) {
    throw new Error("Cannot delete category with existing products")
  }

  await prisma.category.delete({
    where: { id }
  })
  revalidatePath("/admin/categories")
}
