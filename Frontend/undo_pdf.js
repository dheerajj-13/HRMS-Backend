
const fs = require('fs');
const path = require('path');

const originalFile = path.resolve('src/pages/ProjectManager/LeaveManagement.tsx');
const backupFile = path.resolve('src/pages/ProjectManager/LeaveManagement.backup.tsx');

if (fs.existsSync(backupFile)) {
    console.log("Found backup file. Restoring...");
    fs.copyFileSync(backupFile, originalFile);
    console.log("Successfully restored LeaveManagement.tsx to previous state.");
} else {
    console.error("Backup file not found. Cannot undo.");
}
