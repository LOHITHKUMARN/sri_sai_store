const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProduct() {
  const id = '4d64f060-e5b8-4cbc-a76f-78e55723a690';
  const product = await prisma.product.update({
    where: { id: id },
    data: {
      imageUrls: ['https://via.placeholder.com/600x400?text=Needs+Real+Photo+-+Wooden+Study+Table']
    }
  });

  console.log(`Updated product: ${product.name}, new imageUrls:`, product.imageUrls);
  await prisma.$disconnect();
}

updateProduct().catch(console.error);
