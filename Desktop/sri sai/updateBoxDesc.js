const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    where: { description: { contains: "WHAT'S IN THE BOX" } }
  });
  let count = 0;
  for (let p of products) {
    if (p.description.includes("<strong>WHAT'S IN THE BOX</strong>")) continue;
    const newDesc = p.description.replace("WHAT'S IN THE BOX", "<strong>WHAT'S IN THE BOX</strong>");
    await prisma.product.update({
      where: { id: p.id },
      data: { description: newDesc }
    });
    count++;
  }
  console.log('Updated ' + count + ' products');
}
main();
