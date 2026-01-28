
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.user.count();
    console.log('User count:', count);
    if (count > 0) {
        const user = await prisma.user.findFirst();
        console.log('Default User ID:', user.id);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
