
import prisma from "./src/db";

async function main() {
    const email = "manager@dotspeaks.com";
    console.log(`Checking role for ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log("User not found!");
    } else {
        console.log(`User Found! Role: '${user.role}'`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
