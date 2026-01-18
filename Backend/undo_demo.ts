
import prisma from "./src/db";

async function main() {
    console.log("--- UNDOING Demo Leave Data ---");
    const email = "john.demo@dotspeaks.com";

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        console.log(`Found demo user ${user.id}. Deleting...`);
        // Cascade delete should remove Employee and LeaveRequests if set up correctly
        // But let's check schema: Employee->User is cascade. LeaveRequest->Employee is cascade.
        // So deleting User should be enough.
        await prisma.user.delete({
            where: { id: user.id }
        });
        console.log("Successfully deleted demo user and related data.");
    } else {
        console.log("Demo user not found. Nothing to undo.");
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
