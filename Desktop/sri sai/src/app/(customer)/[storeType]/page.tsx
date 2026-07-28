import { prisma } from "@/lib/prisma"
import ListingClient from "./ListingClient"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export default async function ListingPage(
  props: { 
    params: Promise<{ storeType: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const resolvedParams = await props.params
  const resolvedSearchParams = await props.searchParams
  const storeType = resolvedParams.storeType.toLowerCase()
  console.log("ListingPage rendered with storeType:", storeType, "resolvedParams:", resolvedParams)

  if (storeType !== "appliances" && storeType !== "furniture") {
    console.log("Calling notFound() because storeType is invalid")
    notFound()
  }

  const storeName = storeType === "appliances" ? "Appliances" : "Furniture"

  // Process search params
  const categoryParam = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
  const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? parseFloat(resolvedSearchParams.minPrice) : undefined
  const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? parseFloat(resolvedSearchParams.maxPrice) : undefined
  const material = typeof resolvedSearchParams.material === 'string' ? resolvedSearchParams.material : undefined
  const color = typeof resolvedSearchParams.color === 'string' ? resolvedSearchParams.color : undefined
  const inStock = resolvedSearchParams.inStock === 'true'
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest'

  let categoryId: string | undefined = undefined;
  if (categoryParam) {
    const cat = await prisma.category.findFirst({ where: { name: { equals: categoryParam, mode: 'insensitive' }, store: { name: storeName } } })
    if (cat) categoryId = cat.id
  }

  const whereClause: any = {
    store: { name: storeName },
    status: 'PUBLISHED'
  }

  if (categoryId) whereClause.categoryId = categoryId
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {}
    if (minPrice !== undefined && !isNaN(minPrice)) whereClause.price.gte = minPrice
    if (maxPrice !== undefined && !isNaN(maxPrice)) whereClause.price.lte = maxPrice
  }
  if (material) whereClause.material = { equals: material, mode: 'insensitive' }
  if (color) whereClause.color = { equals: color, mode: 'insensitive' }
  if (inStock) whereClause.inStock = true

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  else if (sort === 'price_desc') orderBy = { price: 'desc' }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderBy,
    select: {
      id: true,
      name: true,
      inStock: true,
      imageUrls: true,
      brand: true,
      price: true,
      categoryId: true,
      isFeatured: true,
      isBestSeller: true,
      specs: true,
      description: true,
      legacyDescription: true
    }
  })

  const categories = await prisma.category.findMany({
    where: { store: { name: storeName } },
    orderBy: { name: 'asc' }
  })

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ListingClient 
        products={products as any[]}
        categories={categories}
        storeType={storeType as "appliances" | "furniture"}
      />
    </Suspense>
  )
}
