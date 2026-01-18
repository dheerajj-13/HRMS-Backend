
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("--- Fixing Employee Profiles ---");

    // 1. Find the operator user (assuming there's one you are testing with)
    // You might want to update this to find ALL operators or a specific email if known
    const operators = await prisma.user.findMany({
        where: { role: 'OPERATOR' },
        include: { Employee: true }
    });

    if (operators.length === 0) {
        console.log("No OPERATOR users found.");
        return;
    }

    for (const user of operators) {
        console.log(`Checking user: ${user.email}`);

        if (user.Employee.length === 0) {
            console.log(`  -> User has NO Employee profile. Creating one...`);

            const newEmployee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    name: user.email.split('@')[0], // Use part of email as name
                    roleTitle: "Operator",
                    department: "Operations",
                    status: "Active"
                }
            });

            console.log(`  -> Created Employee: ${newEmployee.name} (${newEmployee.id})`);
        } else {
            console.log(`  -> User already has Employee profile: ${user.Employee[0].id}`);
        }
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
