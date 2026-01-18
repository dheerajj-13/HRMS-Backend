

import prisma from "./src/db";


async function main() {
    console.log("--- Testing Leave Creation Logic ---");

    // 1. Find the operator
    const user = await prisma.user.findFirst({
        where: { role: 'OPERATOR' },
        include: { Employee: true }
    });

    if (!user || user.Employee.length === 0) {
        console.log("No eligible user found.");
        return;
    }

    const employee = user.Employee[0];
    console.log(`Using Employee: ${employee.name} (${employee.id})`);

    // 2. Try to create a leave request
    try {
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                reason: "Test Leave from Script",
                startDate: new Date(),
                endDate: new Date(),
                status: "PENDING",
            },
        });
        console.log("Successfully created leave request:", leaveRequest);
    } catch (error) {
        console.error("FATAL: Failed to create leave request via Prisma:", error);
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
