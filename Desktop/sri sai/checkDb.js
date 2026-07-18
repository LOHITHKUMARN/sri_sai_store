const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const fCount = await prisma.product.count({ where: { store: { name: 'Furniture' }, status: 'PUBLISHED' } });
  const aCount = await prisma.product.count({ where: { store: { name: 'Appliances' }, status: 'PUBLISHED' } });
  console.log("Published Furniture count:", fCount);
  console.log("Published Appliances count:", aCount);
}
main().finally(() => prisma.$disconnect());
