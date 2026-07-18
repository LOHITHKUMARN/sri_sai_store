import { prisma } from "@/lib/prisma"
import BrandClient from "./BrandClient"

export const dynamic = "force-dynamic"

export default async function BrandsAdminPage() {
  const logos = await prisma.brandLogo.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BrandClient initialLogos={logos} />
    </div>
  )
}
