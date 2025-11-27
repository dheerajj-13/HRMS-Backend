import { Router } from "express";
import { requireRole } from "../middleware/role.js";
import { auth } from "../middleware/auth.js";
import prisma from "../db";
import { requireAuth } from "../middleware/requireAuth.js";
import { kcAssignRealmRole, kcCreateUser } from "../auth/kc-users.js";

const router = Router();

// GET all employees (manager)

// Get employees assigned to the logged-in manager
router.get("/employees", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
  const managerId = req.user!.id;

  try {
    const employees = await prisma.employee.findMany({
      where: { managerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tasksAssigned: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                fileUrl_manager: true,
                fileUrl_operator: true,
              },
            },
          },
        },
      },
    });

    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.roleTitle,
      email: emp.user.email,
      tasks: emp.user.tasksAssigned.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status === "DONE" ? "Done" : task.status,
        priority: task.priority,
        fileUrl_manager: task.fileUrl_manager,
        fileUrl_operator: task.fileUrl_operator,
        dueDate: task.dueDate?.toISOString().split("T")[0] || null, // format as YYYY-MM-DD
      })),
    }));

    res.json({ employees: formattedEmployees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

router.post("/create", requireAuth, async (req, res) => {
  try {
    const { email, name, roleTitle, department, role } = req.body;

    // 1️⃣ Create user in Keycloak
    const kcUser = await kcCreateUser({
      email,
      firstName: name,
      tempPassword: "Temp@123",
    });
    await kcAssignRealmRole(kcUser.id, role);

    // 2️⃣ Store in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        password: "",
        role,
      },
    });

    await prisma.employee.create({
      data: {
        userId: user.id,
        name,
        roleTitle,
        department,
      },
    });

    // 3️⃣ Link with ExternalIdentity
    await prisma.externalIdentity.create({
      data: {
        provider: "keycloak",
        subject: kcUser.id,
        email,
        userId: user.id,
      },
    });

    res.json({ success: true, message: "Employee created in Keycloak + DB" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET dashboard metrics
router.get("/dashboard", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
  const managerId = req.user!.id;

  // Total employees
  const totalEmployees = await prisma.employee.count({
    where: { managerId },
  });

  // Active employees
  const activeEmployees = await prisma.employee.count({
    where: { status: "Active", managerId },
  });

  // Total tasks created by this manager
  const totalTasks = await prisma.task.count({
    where: { createdById: managerId },
  });

  // Completed tasks
  const completedTasks = await prisma.task.count({
    where: { createdById: managerId, status: "DONE" },
  });

  // Completion rate
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Weekly hours overview (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

  const weeklyTasks = await prisma.task.findMany({
    where: {
      createdById: managerId,
      dueDate: { gte: oneWeekAgo },
      assignedHours: { not: null },
    },
    select: { dueDate: true, assignedHours: true },
  });

  // Sum hours per day
  const weeklyData: { day: string; hours: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(oneWeekAgo);
    date.setDate(oneWeekAgo.getDate() + i);
    const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
    const hours = weeklyTasks
      .filter((t) => t.dueDate!.toDateString() === date.toDateString())
      .reduce((sum, t) => sum + (t.assignedHours || 0), 0);
    weeklyData.push({ day: dayStr, hours });
  }

  // Task completion trend (last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const trendTasks = await prisma.task.findMany({
    where: { createdById: managerId, dueDate: { gte: fourWeeksAgo } },
    select: { dueDate: true, status: true },
  });

  const performanceData: { week: string; completion: number }[] = [];
  for (let w = 0; w < 4; w++) {
    const start = new Date(fourWeeksAgo);
    start.setDate(fourWeeksAgo.getDate() + w * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const weekTasks = trendTasks.filter(
      (t) => t.dueDate! >= start && t.dueDate! <= end
    );
    const doneCount = weekTasks.filter((t) => t.status === "DONE").length;
    const completion =
      weekTasks.length > 0
        ? Math.round((doneCount / weekTasks.length) * 100)
        : 0;

    performanceData.push({ week: `Week ${w + 1}`, completion });
  }

  // Team overview: employees with tasks completed & hours logged
  const employees = await prisma.employee.findMany({
    where: { managerId },
    include: {
      user: {
        include: {
          tasksAssigned: true, // include all fields of tasksAssigned
        },
      },
    },
  });

  const teamOverview = employees.map((emp) => {
    const tasks = emp.user?.tasksAssigned || [];
    const tasksCompleted = tasks.filter((t) => t.status === "DONE").length;
    const hoursLogged = tasks.reduce(
      (sum, t) => sum + (t.assignedHours || 0),
      0
    );
    const efficiency =
      tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;
    return {
      id: emp.id,
      name: emp.name,
      role: emp.roleTitle,
      status: emp.status,
      tasksCompleted,
      hoursLogged,
      efficiency,
    };
  });

  res.json({
    totalEmployees,
    activeEmployees,
    totalTasks,
    completionRate,
    weeklyData,
    performanceData,
    teamOverview,
  });
});

// GET my employee profile (operator)
router.get("/me", auth, requireRole("OPERATOR"), async (req, res) => {
  const me = await prisma.employee.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
  res.json(me);
});

// Create employee + user (manager)
router.post("/", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
  const { email, password, name, roleTitle, department } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "email, password, name required" });

  const managerId = req.user!.id;

  if (!managerId)
    return res.status(400).json({ error: "Manager ID not found" });

  const bcrypt = await import("bcrypt");
  const hash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_ROUNDS) || 10
  );

  const user = await prisma.user.create({
    data: { email, password: hash, role: "OPERATOR" },
  });

  const employee = await prisma.employee.create({
    data: {
      userId: user.id,
      name,
      roleTitle: roleTitle ?? "Operator",
      department,
      managerId,
    },
  });

  res.status(201).json({
    employee,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

// performace
router.get("/performance", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
  try {
    const managerId = req.user!.id;

    // Fetch employees under this manager
    const employees = await prisma.employee.findMany({
      where: { managerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tasksAssigned: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                assignedHours: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      roleTitle: emp.roleTitle,
      email: emp.user.email,
      department: emp.department,
      status: emp.status,
      totalTasks: emp.user.tasksAssigned.length,
      completedTasks: emp.user.tasksAssigned.filter((t) => t.status === "DONE")
        .length,
      pendingTasks: emp.user.tasksAssigned.filter((t) => t.status !== "DONE")
        .length,
    }));

    res.json({ employees: formatted });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ✅ 2️⃣ Get full performance details of one employee
 * Used when clicking on an employee from the left list
 */
router.get("/:employeeId", auth, requireRole("MANAGER", "PROJECT_MANAGER"), async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tasksAssigned: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                assignedHours: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const tasks = employee.user.tasksAssigned;

    // --- Simple computed analytics ---
    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const working = tasks.filter((t) => t.status === "WORKING").length;
    const stuck = tasks.filter((t) => t.status === "STUCK").length;

    const completionRate = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

    // Calculate total assigned hours (if available)
    const totalHours = tasks.reduce(
      (acc, t) => acc + (t.assignedHours || 0),
      0
    );

    const performance = {
      totalTasks,
      completed,
      working,
      stuck,
      completionRate: Math.round(completionRate),
      totalHours,
    };

    res.json({
      employee: {
        id: employee.id,
        name: employee.name,
        roleTitle: employee.roleTitle,
        department: employee.department,
        email: employee.user.email,
        status: employee.status,
      },
      performance,
      tasks,
    });
  } catch (err) {
    console.error("Error fetching employee details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/:employeeId/performance",
  auth,
  requireRole("MANAGER", "PROJECT_MANAGER"),
  async (req, res) => {
    try {
      const { employeeId } = req.params;

      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              tasksAssigned: true, // all tasks
            },
          },
        },
      });

      if (!employee)
        return res.status(404).json({ error: "Employee not found" });

      const tasks = employee.user.tasksAssigned;

      // Compute performance metrics
      const totalTasks = tasks.length;
      const completed = tasks.filter((t) => t.status === "DONE").length;
      const working = tasks.filter((t) => t.status === "WORKING").length;
      const stuck = tasks.filter((t) => t.status === "STUCK").length;
      const pending = totalTasks - completed;
      const completionRate =
        totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

      const totalHours = tasks.reduce(
        (acc, t) => acc + (t.assignedHours || 0),
        0
      );

      // Mock charts data (you can adjust to real logic)
      const weeklyHours = [
        { day: "Mon", hours: 8 },
        { day: "Tue", hours: 8 },
        { day: "Wed", hours: 8 },
        { day: "Thu", hours: 8 },
        { day: "Fri", hours: 8 },
      ];

      const completionTrend = [
        { week: "Week 1", completion: 50 },
        { week: "Week 2", completion: 60 },
        { week: "Week 3", completion: 70 },
        { week: "Week 4", completion: Math.round(completionRate) },
      ];

      const radar = [
        { metric: "Quality", A: 80, fullMark: 100 },
        { metric: "Speed", A: 70, fullMark: 100 },
        { metric: "Collaboration", A: 75, fullMark: 100 },
        { metric: "Innovation", A: 90, fullMark: 100 },
        { metric: "Reliability", A: 85, fullMark: 100 },
      ];

      const skills = [
        { skill: "React", percentage: 90 },
        { skill: "TypeScript", percentage: 85 },
        { skill: "UI/UX", percentage: 80 },
      ];

      const achievements = [
        { title: "Top Performer", subtitle: "Last Week", icon: "Trophy" },
      ];

      const performance = {
        hours: totalHours,
        hoursChange: 0,
        completionRate: Math.round(completionRate),
        completionChange: 0,
        engagement: 80,
        engagementChange: 0,
        rating: 4.5,
        ratingChange: 0,
        weeklyHours,
        completionTrend,
        radar,
        skills,
        achievements,
      };

      res.json({
        employee: {
          id: employee.id,
          name: employee.name,
          roleTitle: employee.roleTitle,
          department: employee.department,
          email: employee.user.email,
          status: employee.status,
        },
        performance,
      });
    } catch (err) {
      console.error("Error fetching employee performance:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// operator

export default router;
