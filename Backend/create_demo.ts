
import prisma from "./src/db";

async function main() {
    console.log("--- Creating Demo Leave Data ---");

    // 1. Create or Find Demo User/Employee
    const email = "john.demo@dotspeaks.com";

    let user = await prisma.user.findUnique({
        where: { email },
        include: { Employee: true }
    });

    if (!user) {
        console.log("Creating Demo User...");
        user = await prisma.user.create({
            data: {
                email,
                password: "demo_password",
                role: "OPERATOR",
                Employee: {
                    create: {
                        name: "John Doe",
                        roleTitle: "Software Engineer",
                        department: "Engineering"
                    }
                }
            },
            include: {
                Employee: true
            }
        });
    } else if (user.Employee.length === 0) {
        console.log("User exists but no employee, creating employee...");
        await prisma.employee.create({
            data: {
                userId: user.id,
                name: "John Doe",
                roleTitle: "Software Engineer",
                department: "Engineering"
            }
        });
        user = await prisma.user.findUnique({ where: { email }, include: { Employee: true } });
    }

    const employee = user!.Employee[0];
    console.log(`Using Employee: ${employee.name}`);

    // 2. Create Leave Request
    const leave = await prisma.leaveRequest.create({
        data: {
            employeeId: employee.id,
            reason: "Family Vacation",
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
            status: "PENDING"
        }
    });

    console.log("Created Demo Leave Request:", leave);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
