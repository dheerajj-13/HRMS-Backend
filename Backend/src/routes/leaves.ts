import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import prisma from "../db";

const router = Router();

// ----------------------------------------
// CREATE: Apply for Leave (Employee)
// ----------------------------------------
router.post("/apply", auth, requireRole("OPERATOR"), async (req, res) => {
    try {
        console.log("Leave Application Request Body:", req.body);
        console.log("User from Token:", req.user);

        const { reason, startDate, endDate } = req.body;

        if (!reason || !startDate || !endDate) {
            console.log("Missing fields in leave application");
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find the employee record associated with the current user
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user!.id },
        });

        if (!employee) {
            console.log("Employee profile not found for user ID:", req.user!.id);
            return res.status(404).json({ error: "Employee profile not found. Please contact HR to link your account." });
        }

        console.log("Found Employee:", employee.id);

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                reason,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: "PENDING",
            },
        });

        console.log("Leave Request Created:", leaveRequest);
        res.status(201).json(leaveRequest);
    } catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ error: "Failed to apply for leave" });
    }
});

// ----------------------------------------
// GET: My Leave Requests (Employee)
// ----------------------------------------
router.get("/mine", auth, requireRole("OPERATOR"), async (req, res) => {
    try {
        console.log("Fetching leaves for user:", req.user!.id);
        const employee = await prisma.employee.findUnique({
            where: { userId: req.user!.id },
        });

        if (!employee) {
            console.log("Employee profile not found for fetching leaves");
            return res.status(404).json({ error: "Employee profile not found" });
        }

        const leaves = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: "desc" },
        });

        res.json(leaves);
    } catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
});

// ----------------------------------------
// GET: All Leave Requests (Manager)
// ----------------------------------------
router.get("/all", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
    try {
        console.log("Fetching all leave requests for manager");
        // Optionally filter by manager's employees if needed, currently fetching all
        const leaves = await prisma.leaveRequest.findMany({
            include: {
                employee: {
                    select: {
                        name: true,
                        roleTitle: true,
                        department: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        console.log("Found leaves:", leaves.length);
        res.json(leaves);
    } catch (error) {
        console.error("Error fetching all leave requests:", error);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
});

// ----------------------------------------
// PATCH: Update Status (Manager)
// ----------------------------------------
router.patch("/:id/status", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("Updating leave status:", { id, status });

        if (!status || !["APPROVED", "DECLINED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updatedLeave = await prisma.leaveRequest.update({
            where: { id: id! },
            data: { status: status as any },
        });

        res.json(updatedLeave);
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ error: "Failed to update leave status" });
    }
});

export default router;
