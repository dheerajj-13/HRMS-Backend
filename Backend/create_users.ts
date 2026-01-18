
import prisma from "./src/db";
import bcrypt from "bcrypt";

async function main() {
    console.log("--- Creating Default Users ---");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create Manager
    const managerEmail = "manager@dotspeaks.com";
    const manager = await prisma.user.upsert({
        where: { email: managerEmail },
        update: { role: "MANAGER" },
        create: {
            email: managerEmail,
            password: hashedPassword,
            role: "MANAGER",
        }
    });
    console.log(`Upserted Manager: ${manager.email} (${manager.role})`);

    // 2. Create Employee
    const employeeEmail = "employee@dotspeaks.com";
    const userEmployee = await prisma.user.upsert({
        where: { email: employeeEmail },
        update: { role: "OPERATOR" },
        create: {
            email: employeeEmail,
            password: hashedPassword,
            role: "OPERATOR",
        }
    });

    // Ensure Employee Profile exists
    const empProfile = await prisma.employee.findUnique({ where: { userId: userEmployee.id } });
    if (!empProfile) {
        await prisma.employee.create({
            data: {
                userId: userEmployee.id,
                name: "Test Employee",
                roleTitle: "Operator",
                department: "Operations"
            }
        });
        console.log("Created Employee Profile for employee@dotspeaks.com");
    }

    console.log(`Upserted Employee: ${userEmployee.email} (${userEmployee.role})`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
