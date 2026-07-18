import { prisma } from "@/lib/prisma"
import HomeClient from "./HomeClient"

const commonSelect = {
  id: true, name: true, inStock: true, imageUrls: true, brand: true, categoryId: true, store: true, category: true
}

export default async function HomePage() {
  const [
    featuredAppliances,
    bestSellerAppliances,
    newLaunchAppliances,
    featuredFurniture,
    bestSellerFurniture,
    newLaunchFurniture,
    categories,
    heroImages,
    brandLogos
  ] = await Promise.all([
    // Appliances
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
      take: 7,
      orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
      select: commonSelect
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
      take: 4,
      orderBy: [{ isBestSeller: 'desc' }, { bestSellerOrder: 'asc' }, { createdAt: 'desc' }],
      select: commonSelect
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: commonSelect
    }),
    // Furniture
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
      take: 7,
      orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
      select: commonSelect
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
      take: 4,
      orderBy: [{ isBestSeller: 'desc' }, { bestSellerOrder: 'asc' }, { createdAt: 'desc' }],
      select: commonSelect
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: commonSelect
    }),
    // Categories
    prisma.category.findMany({
      include: { store: true }
    }),
    // Hero Images
    prisma.heroImage.findMany({
      orderBy: { order: 'asc' }
    }),
    // Brand Logos
    prisma.brandLogo.findMany({
      orderBy: { order: 'asc' }
    })
  ])
  
  const applianceCategories = categories.filter(c => c.store?.name === "Appliances")
  const furnitureCategories = categories.filter(c => c.store?.name === "Furniture")

  return (
    <HomeClient 
      featuredAppliances={featuredAppliances as any}
      bestSellerAppliances={bestSellerAppliances as any}
      newLaunchAppliances={newLaunchAppliances as any}
      featuredFurniture={featuredFurniture as any}
      bestSellerFurniture={bestSellerFurniture as any}
      newLaunchFurniture={newLaunchFurniture as any}
      applianceCategories={applianceCategories}
      furnitureCategories={furnitureCategories}
      heroImages={heroImages}
      brandLogos={brandLogos}
    />
  )
}
