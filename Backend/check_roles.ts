
import prisma from "./src/db";

async function main() {
    console.log("--- Listing Users & Roles ---");
    const users = await prisma.user.findMany();
    users.forEach(u => {
        console.log(`Email: ${u.email}, Role: '${u.role}'`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
