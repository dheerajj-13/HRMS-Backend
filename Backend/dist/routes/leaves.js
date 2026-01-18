"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// ----------------------------------------
// CREATE: Apply for Leave (Employee)
// ----------------------------------------
router.post("/apply", auth_1.auth, (0, role_1.requireRole)("OPERATOR"), async (req, res) => {
    try {
        console.log("Leave Application Request Body:", req.body);
        console.log("User from Token:", req.user);
        const { reason, startDate, endDate } = req.body;
        if (!reason || !startDate || !endDate) {
            console.log("Missing fields in leave application");
            return res.status(400).json({ error: "All fields are required" });
        }
        // Find the employee record associated with the current user
        const employee = await db_1.default.employee.findUnique({
            where: { userId: req.user.id },
        });
        if (!employee) {
            console.log("Employee profile not found for user ID:", req.user.id);
            return res.status(404).json({ error: "Employee profile not found. Please contact HR to link your account." });
        }
        console.log("Found Employee:", employee.id);
        const leaveRequest = await db_1.default.leaveRequest.create({
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
    }
    catch (error) {
        console.error("Error applying for leave:", error);
        res.status(500).json({ error: "Failed to apply for leave" });
    }
});
// ----------------------------------------
// GET: My Leave Requests (Employee)
// ----------------------------------------
router.get("/mine", auth_1.auth, (0, role_1.requireRole)("OPERATOR"), async (req, res) => {
    try {
        console.log("Fetching leaves for user:", req.user.id);
        const employee = await db_1.default.employee.findUnique({
            where: { userId: req.user.id },
        });
        if (!employee) {
            console.log("Employee profile not found for fetching leaves");
            return res.status(404).json({ error: "Employee profile not found" });
        }
        const leaves = await db_1.default.leaveRequest.findMany({
            where: { employeeId: employee.id },
            orderBy: { createdAt: "desc" },
        });
        res.json(leaves);
    }
    catch (error) {
        console.error("Error fetching leave requests:", error);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
});
// ----------------------------------------
// GET: All Leave Requests (Manager)
// ----------------------------------------
router.get("/all", auth_1.auth, (0, role_1.requireRole)("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
    try {
        console.log("Fetching all leave requests for manager");
        // Optionally filter by manager's employees if needed, currently fetching all
        const leaves = await db_1.default.leaveRequest.findMany({
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
    }
    catch (error) {
        console.error("Error fetching all leave requests:", error);
        res.status(500).json({ error: "Failed to fetch leave requests" });
    }
});
// ----------------------------------------
// PATCH: Update Status (Manager)
// ----------------------------------------
router.patch("/:id/status", auth_1.auth, (0, role_1.requireRole)("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        console.log("Updating leave status:", { id, status });
        if (!status || !["APPROVED", "DECLINED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const updatedLeave = await db_1.default.leaveRequest.update({
            where: { id: id },
            data: { status: status },
        });
        res.json(updatedLeave);
    }
    catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ error: "Failed to update leave status" });
    }
});
exports.default = router;
//# sourceMappingURL=leaves.js.map