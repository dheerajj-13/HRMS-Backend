
const fs = require('fs');
const path = require('path');

const backups = [
    { original: 'src/components/Layout.tsx', backup: 'src/components/Layout.backup.tsx' },
    { original: 'src/pages/LeaveApplication.tsx', backup: 'src/pages/LeaveApplication.backup.tsx' },
    { original: 'src/pages/ProjectManager/LeaveManagement.tsx', backup: 'src/pages/ProjectManager/LeaveManagement.backup.tsx' },
    { original: 'src/pages/MainManager/EmployeeAssignment.tsx', backup: 'src/pages/MainManager/EmployeeAssignment.backup.tsx' }
];

backups.forEach(({ original, backup }) => {
    const backupPath = path.resolve(backup);
    const originalPath = path.resolve(original);

    if (fs.existsSync(backupPath)) {
        console.log(`Restoring ${original}...`);
        fs.copyFileSync(backupPath, originalPath);
    } else {
        console.warn(`Backup not found for ${original}`);
    }
});

console.log("Notification system undo complete.");
