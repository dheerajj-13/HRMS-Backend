
import prisma from "./db";

async function main() {
    console.log("Checking Users...");
    const users = await prisma.user.findMany({
        include: {
            Employee: true
        }
    });

    console.log("Found", users.length, "users:");
    users.forEach(u => {
        console.log(`User: ${u.email} (${u.role}) - Employee Profile: ${u.Employee.length > 0 ? "YES" : "NO"}`);
        if (u.Employee.length > 0) {
            console.log(`  -> Employee ID: ${u.Employee[0].id}, Name: ${u.Employee[0].name}`);
        }
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
