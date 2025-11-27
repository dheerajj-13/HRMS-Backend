import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import prisma from '../db';
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from '../middleware/role';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase environment variables are not set");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

router.get("/ManagerTasks", auth, async (req, res) => {
  try {
    const employeeId = req.user!.id;

    // 1. Fetch tasks assigned to the logged-in employee
    const tasks = await prisma.task.findMany({
      where: { assigneeId: employeeId },
      include: {
        createdBy: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // 2. Map manager files from Supabase
    const tasksWithFiles = await Promise.all(
      tasks.map(async (task) => {
        // Manager files (from bucket: ManagerFiles, folder: task.id)
        const { data: managerFiles } = await supabase.storage
          .from("projectManagerFiles")
          .list(task.id, { limit: 10 });

        const managerFileUrls =
          managerFiles?.map(
            (file) =>
              supabase.storage
                .from("projectManagerFiles")
                .getPublicUrl(`${task.id}/${file.name}`).data.publicUrl
          ) || [];

        // Employee uploaded files (from bucket: OperationsDocuments)
        const { data: employeeFiles } = await supabase.storage
          .from("ManagerAddedDocuments")
          .list(task.id, { limit: 10 });

        const employeeFileUrls =
          employeeFiles?.map(
            (file) =>
              supabase.storage
                .from("ManagerAddedDocuments")
                .getPublicUrl(`${task.id}/${file.name}`).data.publicUrl
          ) || [];

        return {
          ...task,
          managerFiles: managerFileUrls,
          employeeFiles: employeeFileUrls,
        };
      })
    );

    res.json({ tasks: tasksWithFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

export default router;