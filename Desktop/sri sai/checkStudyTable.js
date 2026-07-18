const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProduct() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Table',
        mode: 'insensitive'
      }
    }
  });

  for (const product of products) {
    console.log(`- ${product.name} (ID: ${product.id}): ${JSON.stringify(product.imageUrls)}`);
  }

  await prisma.$disconnect();
}

checkProduct().catch(console.error);
