import { prisma } from "@/lib/prisma"
import HeroClient from "./HeroClient"

export default async function HeroPage() {
  const heroImages = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' }
  })

  return <HeroClient initialImages={heroImages} />
}
